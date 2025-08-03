/// <reference types="vite/client" />

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setTextStyle: (attributes: Record<string, any>) => ReturnType;
    unsetTextStyle: (name?: string | string[]) => ReturnType;
  }
}