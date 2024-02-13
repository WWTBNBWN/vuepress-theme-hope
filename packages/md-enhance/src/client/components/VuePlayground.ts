import type { Repl, ReplProps, Store } from "@vue/repl";
import { deepAssign } from "@vuepress/helper/client";
import type { Component, VNode } from "vue";
import { computed, defineComponent, h, onMounted, ref, shallowRef } from "vue";
import { LoadingIcon } from "vuepress-shared/client";

import { useVuePlaygroundConfig } from "../helpers/index.js";
import { getVuePlaygroundSettings } from "../utils/index.js";

import "@vue/repl/style.css";
import "../styles/vue-playground.scss";

export default defineComponent({
  name: "VuePlayground",

  props: {
    /**
     * Playground title
     *
     * 演示标题
     */
    title: {
      type: String,
      default: "",
    },

    /**
     * Playground file data
     *
     * 演示文件数据
     */
    files: { type: String, required: true },

    /**
     * Playground settings
     *
     * 演示设置
     */
    settings: { type: String, default: "{}" },
  },

  setup(props) {
    const {
      vueUrl = `https://unpkg.com/vue/dist/runtime-dom.esm-browser.js`,
      vueVersion = null,
      ...vuePlaygroundOptions
    } = useVuePlaygroundConfig();
    const loading = ref(true);
    const component = shallowRef<typeof Repl>();
    const store = shallowRef<Store>();
    const editor = shallowRef<Component>();

    const playgroundOptions = computed(() =>
      deepAssign(
        {},
        vuePlaygroundOptions,
        getVuePlaygroundSettings(props.settings),
      ),
    );

    const setupRepl = async (): Promise<void> => {
      const [{ useStore, Repl }, { default: codeMirror }] = await Promise.all([
        import(/* webpackChunkName: "vue-repl" */ "@vue/repl"),
        import(
          /* webpackChunkName: "vue-repl" */ "@vue/repl/codemirror-editor"
        ),
      ]);

      component.value = Repl;
      editor.value = codeMirror;
      store.value = useStore(
        {
          builtinImportMap: ref({
            imports: {
              vue: vueUrl,
            },
          }),
          vueVersion: ref(vueVersion),
        },
        decodeURIComponent(props.files),
      );
    };

    onMounted(async () => {
      await setupRepl();
      loading.value = false;
    });

    return (): (VNode | null)[] => [
      h("div", { class: "vue-playground-wrapper" }, [
        props.title
          ? h("div", { class: "header" }, decodeURIComponent(props.title))
          : null,
        h("div", { class: "repl-container" }, [
          loading.value
            ? h(LoadingIcon, { class: "preview-loading", height: 192 })
            : null,
          component.value
            ? h(component.value, <ReplProps>{
                ...playgroundOptions.value,
                editor: editor.value,
                store: store.value,
              })
            : null,
        ]),
      ]),
    ];
  },
});
