import 'amfe-flexible';
import _ from 'lodash';

import '../css/index.css';
import m from './page_module';
import c from '@c/comp';

const pageName = "page about";

function print() {
  console.log(_.trim(pageName));
}
print();

m();
c();

if (module.hot) { 
  module.hot.accept();
}