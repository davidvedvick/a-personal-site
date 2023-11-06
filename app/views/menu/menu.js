import pkg from 'react-hyperscript-helpers';
const { ul, hh } = pkg;

import MenuItem from './menu-item.js';

export default hh(() => {
  const menuNodes = [
    {
      'link': '/projects',
      'caption': 'Side Projects'
    },
    {
      'link': '/resume',
      'caption': 'Resume'
    },
    {
      'link': '/notes',
      'caption': 'Notes'
    }
  ].map(menuNode => MenuItem({menuItem: menuNode}));

  return ul('.menu-list', menuNodes);
});
