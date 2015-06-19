title: A guide to initialization logic
link: http://davidvedvick.info/2011/07/17/coding/a-guide-to-initialization-logic/
author: vedvick
description: 
post_id: 921
created: 2011/07/17 09:40:13
created_gmt: 2011/07/17 15:40:13
comment_status: open
post_name: a-guide-to-initialization-logic
status: publish
post_type: post

# A guide to initialization logic

I have seen many a programmer make some basic logic mistakes that could save them a lot of time and cleanliness.   The simple case is this: Let's say you want a = 5 when "condition" is true, and a = 4 otherwise. Below may seem the obvious way to do it: 
    
    
    if (condition is true) {
         a = 5
    }
    else {
         a = 4
    }

Now, there is nothing wrong with this in a basic scenario. However, if you have other nested if's where it must equal another number, it can get confusing. So let's make our conditions more complicated. Let's say if George is 5, we give him 5 apples. If George is 6, we give him 7 apples. Otherwise, we give him 4. Using the above logic and extending it, we end up with something like this: 
    
    
    if (George == 5) {
         apples = 5
    }
    else if (George == 6) {
         apples = 7
    }
    else {
         apples = 4
    }

Once again, nothing implicitly wrong in this scenario. However, what if the age we're given for George is, say -1? Let's say, for our robust apple giving programming language, that this results in an impossible age exception. Thus, we must try and catch this language now: 
    
    
    try {
         if (George == 5) {
              apples = 5
         }
         else if (George == 6) {
              apples = 7
         }
         else {
              apples = 4
         }
    } catch (AgeException AgeExc) {
         apples = 4
    }

Here you can see the cracks in using the above logic where you set apples = 4 after you confirm _no other scenario is true_.  You have to now set apples = 4 twice, unless you prevent this exception from occurring.  This would would like this: 
    
    
    if (George == 5) {
         apples = 5
    }
    else if (George == 6) {
         apples = 7
    }
    else if (George < 0) {
         apples = 4
    }
    else {
         apples = 4
    }

So, different code, same result, apples has to be set to 4 in two different conditions.  I could go on with examples much more complicated than this, but I will save you the time and present you a much simpler solution to the problem: _initializing apples to 4 at the beginning of the program_.  So, if you set apples = 4 at the beginning of the program, what does our code now look like?   With the try catch block: 
    
    
    apples = 4
    try {
         if (George == 5) {
              apples = 5
         }
         else if (George == 6) {
              apples = 7
         }
    } catch (AgeException AgeExc) {
    }

Without a try catch block: 
    
    
    apples = 4
    if (George == 5) {
         apples = 5
    }
    else if (George == 6) {
         apples = 7
    }

  You can see here that we've reduced the complexity of the program substantially, while reducing the programmer's risk to the otherwise apples value changing in the future (let's say we want to give George 10 apples when he's not 5 or 6 in the future), by only providing one area where the default value for Apples would need to be changed. While the logic may seem less straight forward, it just requires a different way of thinking: You must say, instead of "if George is 5, we give him 5 apples. If George is 6, we give him 7 apples. Otherwise, we give him 4", "George will get 4 apples no matter what. However, if he is 5, we will instead give him 5 apples, and if he is 6, we will instead give him 7 apples".  This has saved me many a time in the past from some pretty basic programming defects that could have been avoided if the amount of logic and amount of initialization had been reduced.