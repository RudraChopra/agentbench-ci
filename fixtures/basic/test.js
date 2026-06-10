import { add } from './add.js';

if (add(2, 3) !== 5) {
  throw new Error('add failed');
}
