declare global {
    interface Window {
      Featurebase: (...args: any[]) => void;
    }
  }
  export {};  