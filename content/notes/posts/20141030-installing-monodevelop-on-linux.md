title: Installing MonoDevelop on Linux
link: http://davidvedvick.info/2014/10/30/coding/installing-monodevelop-on-linux/
author: vedvick
description: 
post_id: 1327
created: 2014/10/30 21:51:17
created_gmt: 2014/10/31 03:51:17
comment_status: open
post_name: installing-monodevelop-on-linux
status: publish
post_type: post

# Installing MonoDevelop on Linux

Today I discovered the joys of "installing" as it were MonoDevelop on Linux. All it took was pulling down from Git, getting all the dependencies (non-trivial) and doing a full build. And then there was something to do with [adding a key of some sort](http://stackoverflow.com/questions/24793207/error-when-compiling-monodevelop-5-3-on-linux) before I could finish the build - since NuGet needs some keys of something or other. Either way - I'm up and running and boy is it fast compared to Java's equivalent (as far as I know), Eclipse. Still running into some issues getting MVC.net up and running, but it looks like [I'm not the only one](http://curtis.schlak.com/2014/02/04/setup-asp-net-mvc-4-on-monodevelop-4.2.html). Here's the [Linux fix](http://stackoverflow.com/a/20577968) since that was a Mac fix.