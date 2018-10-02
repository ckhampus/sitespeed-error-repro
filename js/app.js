if ("serviceWorker" in window.navigator) {
  window.addEventListener("load", () => {
    window.navigator.serviceWorker.register("sw.js");
  });
}

fetch('https://httpbin.org/json').then(() => console.log('Request complete!'))