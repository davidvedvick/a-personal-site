title: Oracle 10G and Parentheses
link: http://davidvedvick.info/2012/10/10/random-thoughts/oh-shit/oracle-10g-and-parentheses/
author: vedvick
description: 
post_id: 996
created: 2012/10/10 21:57:08
created_gmt: 2012/10/11 03:57:08
comment_status: open
post_name: oracle-10g-and-parentheses
status: publish
post_type: post

# Oracle 10G and Parentheses

A word of warning to all who are still stuck with using Oracle 10G 32-bit in a 64-bit environment: _Do not install  your programs in a path where one of the folders has parentheses in it. _ So, in other words, the most common 32-bit install path, "C:\Program Files (x86)\\.." is unusable if you have an app that uses Oracle 10G 32-bit. Oracle cannot handle this situation, and is unable to even complete a TNS Look-up and make a connection. Bleh.