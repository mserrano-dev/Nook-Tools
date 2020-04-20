console.error('hello main.ts');

import { Home } from 'modules/home/home';
import { square } from 'modules/store/store';

const test = [1,2,3];
for (var num of test) {
  console.log(num);
}
let home = new Home();
home.init();

console.log(square(26));