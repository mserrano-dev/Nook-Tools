import Vue from 'vue';

class Home {
  init(){ 
    new Vue({
      el: '#app',
      data: {
        message: 'Hello Vue!'
      },
      delimiters: ['${', '}']
    });
  }
}

export { Home };
