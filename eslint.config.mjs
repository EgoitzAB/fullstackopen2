import js from "@eslint/js";
import globals from "globals";
import stylistic from '@stylistic/eslint-plugin';
import pluginJs from "@eslint/js";
import { plugin } from "mongoose";


export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.node },
    plugins: { js, stylistic },
    extends: [ "js/recommended"]
  }
]);