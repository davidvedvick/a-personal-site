title: Android Media Streamer App Progress
link: http://davidvedvick.info/2013/03/17/coding/android-media-streamer-app-progress/
author: vedvick
description: 
post_id: 1208
created: 2013/03/17 20:55:16
created_gmt: 2013/03/18 02:55:16
comment_status: open
post_name: android-media-streamer-app-progress
status: publish
post_type: post

# Android Media Streamer App Progress

For some reason, programming in Java makes me feel like blogging. I think it's just the monumental amount of work involved in getting some of the basic things done that makes me particularly angsty (don't get me started on setting up your own events). Anyways, I've made some decent progress: 

  * The state machine logic to get the Service to pre-buffer the next file to be played in a playlist in a background thread
  * The connection has some fault-tolerance so that if you move away from your local network it tries to get the remote URL and connect to it
  * Album art now displays in the Now playing dialogue
  * The notification changes with the album
My next steps: 
  * Add playlists as a "Category" to browse like the normal categories (whatever is set in the Media Center configuration)
  * Add the ability to choose different play modes on a "long-click" of any item that is not a category
  * Add play controls
  * Add progress indicator
  * Make sure you can start a different playlist if you choose to (I'm afraid to test this out ;))
Sorry for any wild grammar or spelling mistakes, my heads kind of throbbing :-/