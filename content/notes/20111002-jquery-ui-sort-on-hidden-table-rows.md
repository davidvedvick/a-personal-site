title: jQuery UI sort on hidden table rows
link: http://davidvedvick.info/2011/10/02/coding/jquery-ui-sort-on-hidden-table-rows/
author: vedvick
description:
post_id: 928
created: 2011/10/02 19:10:50
created_gmt: 2011/10/03 01:10:50
comment_status: open
post_name: jquery-ui-sort-on-hidden-table-rows
status: publish
post_type: post

# jQuery UI sort on hidden table rows

jQuery UI's [sortable](http://jqueryui.com/demos/sortable/) works great on tables in the newest version, 1.8.  I've been using it for some pretty interesting sorting of data involving complex parent child relationships, where one row may have children directly below it. However, I recently had a major issue, where rows were flickering when you would try to move them and the placeholder would continuously jump down to the second to last row.  This was very confusing, as I had done many more complicated things with table sorting in IE8. After 5+ hours of troubleshooting that I won't go into, but will reassure you, was quite frustrating, I finally had  revelation after I stepped away from my computer:  hidden rows were in the table, and these were causing the conflicts!  jQuery UI sortable calculates the position of your sorting row by first getting the height of all the rows that can be sorted. If your table is like so:

```
    <table>
         <tr><td>Row 1</td></tr>
         <tr><td>Row 1</td></tr>
         <tr style="display:none"><td>Row 3</td></tr>
         <tr><td>Row 4</td></tr>
    </table>
```

You will discover that, at least in IE8, your table sorting will not work work as expected.  You will see various flickering issues and rows being dropped in the incorrect places if you just do a basic jQuery UI sortable declaration: `$('table').sortable();` Instead, what you will need to do is a slightly more clever declaration: `$('table').sortable({items: 'tr:visible'});` This will only sort on the currently visible rows.  This worked really well and only involved a small code change to implement the change. Hope this helps others if they are implementing jQuery UI's sortable on a table.
