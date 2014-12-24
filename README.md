nw-program-manager
==================

Program manager based on node-webkit(nw),server end(or port) through mysql db server to control the client program.

It is a program manager application that based on node-webkit, as show below:

![](https://raw.githubusercontent.com/xiebaochun/nw-program-manager/master/images/help/naotu1.png)

![](https://raw.githubusercontent.com/xiebaochun/nw-program-manager/master/images/help/naotu2.png)

#How to use it?

##Step 1: Choose the user


![](https://raw.githubusercontent.com/xiebaochun/nw-program-manager/master/images/help/1.png)

##Step 2: Setting the database
  Setting the mysql db as below,then click the connect button,if connected the button will become green,and the button text will change to "disconnect"(click it again to disconnect the db).In this case,you should make sure the db server is running,and the setting is right work.

##Step 3: Add or remove app items 
  As show below picture,Click the Add button to add the app items, after that,the app item row will be added to center.As the same remove button.

![](https://raw.githubusercontent.com/xiebaochun/nw-program-manager/master/images/help/2.png)

## Step 4: Select .exe file
  As below image showed,click the slect button that layed on app item row,to select the window`s application which controled by other side(controller).
![](https://raw.githubusercontent.com/xiebaochun/nw-program-manager/master/images/help/3.png)

# Controller Side

## Step 1: 
   As the same as client side,settting the db and click the coonect button to connect the db server.as below:
![](https://raw.githubusercontent.com/xiebaochun/nw-program-manager/master/images/help/4.png)

## Step 2:
   After connected the db server, it will auto load the app items form server,and it will update once per second.Then you can control the remote client end`s apps through the run & close button.As below:
![](https://raw.githubusercontent.com/xiebaochun/nw-program-manager/master/images/help/5.png)

# Summary
  If there is any questions,please commit in the issue page,or jion in the QQ group:139761568 . Thanks!