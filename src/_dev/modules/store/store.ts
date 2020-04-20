console.error('hello store.ts');


// tree shaking should remove this from final asset file
export function square(x: number) {
  return x * x;
}