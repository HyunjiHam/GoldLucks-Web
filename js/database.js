function GoldLucksDB(){
}

(function strict(){
  GoldLucksDB.prototype={

    init : function init(){
      this.expenseArray = [];
      this.db={};
      this.version = 1.0;
      this.dbName="GoldLucksDB";
      this.dbDisplayName="GoldLucksDisplay";
      this.dbSize = 2*1024*1024;
      this.moneys=[];
      this.openDatabase();
      this.total;
      this.tExpense;
      this.tIncome;
    },

    openDatabase : function(){
  		if(window.openDatabase){
  			this.db = openDatabase(this.dbName, this.version, this.dbDisplayName, this.dbSize);
  			this.createTable(this.db);
  		}else {
  	        alert("Web SQL Database not supported");
  		}
  	},

  	/**
  	 * store expense/income money
  	 * @param fromWhere - from expense or income screen
  	 * @param money
  	 * @param currentBook - sharing account book or not
  	 */
    insertData : function insertData(fromWhere,money,currentBook){
      var db = this.db;
      //var shareBN = "My Account Book";
      var shareBN = currentBook;
      if(fromWhere === "fromExpense"){

    	  if(shareBN === "My Account Book"){
    		  console.log("shareBN: "+shareBN);
  			db.transaction(function(tx){
  				tx.executeSql(
  					"INSERT INTO money(date, amount, used, category, method, income, memo) VALUES (?,?,?,?,?,?,?);",
            [money.date,money.amount,money.used,money.category,money.method,0,money.memo],
  					function onSuccess() {//run if SQL succeeds
  						return;
  					},
  					function onError(e) { //run if SQL fails
  						alert("Error:" + e.message);
  					}
  				);
  			});
    	  }
    	  else{	// When user writes sharing book account
    			db.transaction(function(tx){
    				console.log("shareBN: "+shareBN);
      				tx.executeSql(
      					"INSERT INTO money(date, bookName, amount, used, category, method, income, memo) VALUES (?,?,?,?,?,?,?,?);",
                [money.date,shareBN,money.amount,money.used,money.category,money.method,0,money.memo],
      					function onSuccess() {//run if SQL succeeds
      						console.log("통신되어라 얍얍");
      				    	 $.ajax({
      			    		   type : "POST",
      			    		   url : "http://localhost:3000/money/",
      			    		   crossDomain : true,
      			    		   data : {bookName: shareBN, amount: money.amount, used: money.used, category: money.category, method: money.method, income: 0, memo: money.memo} ,
      			    		   dataType : "json",
      			    		   success: function(result){
      			    			   console.log(result);
      			    		    },
      			    		   error : function (result) {
      			    		    alert('실패 - .', result);
      			    		   }
      			    	 });
      					},
      					function onError(e) { //run if SQL fails
      						alert("Error:" + e.message);
      					}
      				);
      			});
    	  }

  		}

  		if(fromWhere === "fromIncome"){
  			if(shareBN === "My Account Book"){
  			db.transaction(function(tx){
  				console.log("shareBN: "+shareBN);
  				tx.executeSql(
  					"INSERT INTO money(date, amount, used, income, memo) VALUES (?,?,?,?,?);",
  					[money.date, money.amount, money.used, 1, money.memo],
  					function onSuccess() {//run if SQL succeeds
  						return;
  					},
  					function onError(e) { //run if SQL fails
  						alert("Error:" + e.message);
  					}
  				);
  			});
  			}
      	  else{	// When user writes sharing account book
  			db.transaction(function(tx){
  				console.log("shareBN: "+shareBN);
    				tx.executeSql(
    					"INSERT INTO money(date, bookName, amount, used, category, method, income, memo) VALUES (?,?,?,?,?,?,?,?);",
              [money.date,shareBN,money.amount,money.used,money.category,money.method,0,money.memo],
    					function onSuccess() {//run if SQL succeeds
    						console.log("통신되어라 얍얍");
    				    	 $.ajax({
    			    		   type : "POST",
    			    		   url : "http://localhost:3000/money/",
    			    		   crossDomain : true,
    			    		   data : {bookName: shareBN, amount: money.amount, used: money.used, category: money.category, method: money.method, income: 1, memo: money.memo} ,
    			    		   dataType : "json",
    			    		   success: function(result){
    			    			   console.log(result);
    			    		    },
    			    		   error : function (data) {
    			    		    alert('실패 - .', result);
    			    		   }
    			    	 });
    					},
    					function onError(e) { //run if SQL fails
    						alert("Error:" + e.message);
    					}
    				);
    			});
  	  }
  		}
  	},

  	/**
  	 * When making sharing account book
  	 * store userId & bookName info in db
  	 * @param bName - bookName
  	 * @param writer - user herself only can write
  	 */
    insertBook: function insertBook(bName,writer){
      var db = this.db;
      db.transaction(function(tx){
        tx.executeSql(
          "INSERT INTO book(bookName, masterId) VALUES (?,?);",
          [bName,writer],
          function onSuccess() {//run if SQL succeeds
        	  console.log("book테이블에 저장함");
            return;
          },
          function onError(e) { //run if SQL fails
            alert("Error:" + e.message);
          }
        );
      });
    },

    /**
     * When making sharing account book
     * send and store sharing info(parameters)
     * in book table of the server
     * @param bookName
     * @param groupName
     * @param userId
     */
    shareBook : function shareBook(bookName,groupName,userId,shareWith){
    	console.log("this in shareBook method: "+this);
    	$.ajax({
    		url: "http://localhost:3000/book/"+userId+"/"+bookName+"/"+groupName,
    		crossDomain : true,
    		success: function(result){
    			console.log("save to the book table in server!");
    	    	$.ajax({
    	    		url: "http://localhost:3000/user/"+userId+"/"+bookName,
    	    		crossDomain : true,
    	    		success: function(result){
    	    			console.log("save to user table");
    	    			console.log(result);
    	    		},
    	    		error: function(xhr) {
    	    			console.log('실패 - ', xhr);
    	    		}
    	        });

    	        $.ajax({
    	          url: "http://localhost:3000/user/"+shareWith+"/"+bookName,
    	          crossDomain : true,
    	          success: function(result){
    	            console.log("member is saved to user table");
    	            console.log(result);
    	          },
    	          error: function(xhr) {
    	            console.log('실패 - ', xhr);
    	          }
    	          });
    		},
    		error: function(xhr) {
    			console.log('실패 - ', xhr);
    		}
        });

    },

    /**
     * When making sharing account book
     * store sharing info(parameters)
     * in user table of the server
     * @param bookName
     * @param userId
     * @param shareWith
     */
    sendShareBook : function sendShareBook(bookName,userId,shareWith){
    	$.ajax({
    		url: "http://localhost:3000/user/"+userId+"/"+bookName,
    		crossDomain : true,
    		success: function(result){
    			console.log("save to user table");
    			console.log(result);
    		},
    		error: function(xhr) {
    			console.log('실패 - ', xhr);
    		}
        });

        $.ajax({
          url: "http://localhost:3000/user/"+shareWith+"/"+bookName,
          crossDomain : true,
          success: function(result){
            console.log("member is saved to user table");
            console.log(result);
          },
          error: function(xhr) {
            console.log('실패 - ', xhr);
          }
          });

    },

    sendShareMember : function sendShareMember(){

    },

    /**
     * Executed as soon as application runs
     * @param db
     */
    createTable : function createTable(db){
          db.transaction(function(tx) {
              tx.executeSql("CREATE TABLE IF NOT EXISTS book"+
                  "(bookId INTEGER PRIMARY KEY,"+
                  "bookName VARCHAR(20) NOT NULL,"+
                  "masterId VARCHAR(10) NOT NULL)",[],
            		function onSuccess() {
            	  		db.transaction(function(tx){
            	  			tx.executeSql(
            	  					"INSERT INTO book(bookId, bookName,masterId) VALUES (?,?,?);",
            	  					[1,'My Account Book','Default']);
            	  		});
              		});
          });

          db.transaction(function(tx) {
              tx.executeSql("CREATE TABLE IF NOT EXISTS user"+
              		"(userId VARCHAR(10) PRIMARY KEY," +
              		"userPwd VARCHAR(10) )");
          });

          db.transaction(function(tx) {
              tx.executeSql("CREATE TABLE IF NOT EXISTS fixedExpenses"+
              		"(id INT(11) PRIMARY KEY,"+
              		"amount FLOAT NOT NULL,"+
              		"used VARCHAR(20) NOT NULL,"+
              		"category INT(1) NOT NULL,"+
              		"alarmDay INT(11) NOT NULL,"+
              		"alarmHour INT(11) NOT NULL,"+
              		"alarmMinute INT(11) NOT NULL,"+
              		"memo VARCHAR(50) )" );
          });

          db.transaction(function(tx) {
              tx.executeSql("CREATE TABLE IF NOT EXISTS money"+
              		"(_id INTEGER PRIMARY KEY,"+
              		"bookName VARCHAR(20) NOT NULL DEFAULT 'My Account Book',"+
              		"date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,"+
              		"amount FLOAT NOT NULL,"+
              		"used VARCHAR(30) NOT NULL,"+
              		"category INT(1),"+
              		"method INT(1),"+
              		"income INT(1) NOT NULL,"+
              		"memo VARCHAR(50) )" );
          });
    },

    /**
     * For showing chart
     * @param catNum2Text - from analysis.js
     * @param analysis
     */
    getExpenses : function getExpenses(catNum2Text,analysis){
        /**
	     * It sets variables for database query.
	     */
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth()+1;
        if(month<10) month = "0"+month;
        var day = today.getDate();
        if(day<10) day = "0"+day;
        var firstDay=year+"-"+month+"-"+"01";
        var todayString = year+"-"+month+"-"+day;
        var db = this.db;


        db.transaction(function(t){
            t.executeSql("SELECT SUM(amount) AS sumAmount, category FROM money WHERE income=? AND (date >= ? AND date <= ?) GROUP BY category",
            [0,firstDay, todayString],
				function(tran, r) {
          analysis.db.expenseArray=[];
				    for (var i = 0; i < r.rows.length; i++){
				        var row = r.rows.item(i);
				        var sumAmount = row.sumAmount;
				        var category = row["category"];

				        //js obj
				        var expensePerCat = {
				            "cat" : category,
				            "amount" : sumAmount
				        };
				        analysis.db.expenseArray.push(expensePerCat);
				    }
            console.log(analysis.db.expenseArray);
				    catNum2Text.apply(analysis,analysis.db.expenseArray);
				}, function(t, e) {
				    alert("Error:" + e.message);
				}
			);
        });
    },

    /**
     * For showing total expense & income at main page
     * @param mainpage
     */
    getTotalExpense : function getTotalExpense(mainpage){
      var db = this.db;
      var self = this;
      var dateee = new Date();
      var year = dateee.getFullYear();
      var month = dateee.getMonth()+1;
      if(month<10) month = "0"+month;
      var day = dateee.getDate();
      if(day<10) day = "0"+day;
      var firstDay=year+"-"+month+"-"+"01";
      var dateString = year+"-"+month+"-"+day;
      var tExpense=0,
          tIncome=0,
          total=0;
        db.transaction(function(t){
            t.executeSql("SELECT SUM(amount) AS sumAmount FROM money WHERE income=? AND (date >= ? AND date <= ?)",
            [0,firstDay, dateString],
        				function(tran, r) {
        				    for (var i = 0; i < r.rows.length; i++) {
        				        var row = r.rows.item(i);
                        if(row.sumAmount!==null){
                          self.tExpense = parseFloat(row.sumAmount);
                        }else{
                          self.tExpense=0;
                        }
        				    }
                    console.log(self.tExpense);
                    //tExpense = r.sumAmount;
        				}, function(t, e) {
        				    alert("Error:" + e.message);
        				}
			      );
        });
        db.transaction(function(tx){
            tx.executeSql("SELECT SUM(amount) AS sumIncome FROM money WHERE income=? AND (date >= ? AND date <= ?)",[1,firstDay, dateString],
          			function(tran, r) {
          			    for (var i = 0; i < r.rows.length; i++) {
          			        var row = r.rows.item(i);
                        if(row.sumIncome!==null){
                          self.tIncome = parseFloat(row.sumIncome);
                        }else{
                          self.tIncome=0;
                        }
          			    }
                    console.log(self.tIncome);
                    //tIncome = r.sumIncome;
                    mainpage.printTotal();
          			}, function(t, e) {
          			    alert("Error:" + e.message);
          			}
          	);
        });

    },


    /**
     * For showing list at main page
     * @param firstDay
     * @param lastDay
     * @param printMoney
     * @param mainpage
     */
    getMoney : function getMoney(firstDay,lastDay,printMoney,mainpage){
        var money={};
        var db = this.db;
        mainpage.moneys=[];
        db.transaction(function (tx) {
                  tx.executeSql("SELECT * FROM money WHERE (date>=? AND date<=?)",[firstDay,lastDay],
                  function(tran,r){
                      for(var i=0;i<r.rows.length;i++){
                          var row = r.rows.item(i);
  	                      var date = row.date,
  	                              amount = row.amount,
  	                              used = row.used,
  	                              category = row.category,
  	                              method = row.method,
  	                              income = row.income,
  	                              memo = row.memo;
                          money={
                              'date': date,
                              'amount': amount,
                              'used' : used,
                              'category' : category,
                              'method' : method,
                              'income' : income,
                              'memo' : memo
                          };
                          mainpage.moneys.push(money);
                          console.log(typeof(mainpage.moneys)+mainpage.moneys.length);
                      }
                      console.log('getMoney() in database is done');
                      if(typeof(printMoney)==="function"){
                        console.log(mainpage);
                        printMoney.apply(mainpage,mainpage.moneys);
                      }
                  },function(tx,e){
                      alert("Error:"+e.message);
                  }
              );
          });
      },


    /**
     * At share page
     * Called after 'shareBookInfo' method
     * @param bookName
     */
	getMoneyFromServer : function getMoneyFromServer(bookName){
		console.log("when a user is a member of sharing account book, she gets the list of all money");
		var date, amount, used, category, method, income, memo;
		var db = this.db;
		$.ajax({
				url: "http://localhost:3000/money/"+bookName,
				crossDomain : true,
				success: function(resultObj){
            		console.log(resultObj);

            		db.transaction(function(tx){
                		$.each(resultObj, function(key, val){
                			date = val.date;
                			bookName = val.bookName;
                			amount = val.amount;
                			used = val.used;
                			category = val.category;
                			method = val.method;
                			income = val.income;
                			memo = val.memo;
                			
                			tx.executeSql(
                					"INSERT INTO money(date, bookName, amount, used, category, method, income, memo) VALUES (?,?,?,?,?,?,?,?);",
                				[date, bookName, amount, used, category, method, income, memo],
                				function onSuccess() {//run if SQL succeeds
                					console.log("서버로부터 돈 받아서 "+bookName+" 넣었당~~~~~~~");

                				},
                				function onError(e) { //run if SQL fails
                					alert("Error:" + e.message);
                				}
                			);
                		});
    					console.log("share2바껴라!");
    			  		$.mobile.changePage('#share2');
    			  		console.log("share2바꼈나?");
            		});
				},
			    error: function(xhr) {
			        console.log('실패 - ', xhr);
			     }
       	});

	},

	/**
	 * At share page
	 * Called after 'refreshFromServer' method
	 * @param self
	 * @param infoObj
	 */
    shareBookInfo : function shareBookInfo(self,userId,obj){
		console.log("get writer's info from the server and save into db");
		var bookName, masterId;
		var db = this.db;
		
		
		$.each(obj, function(k,v){
			console.log("key: "+k);
			console.log("val.bookName: "+v.bookName);
	//		console.log("val.userId: "+v.userId);
			
			db.transaction(function(tx){
				bookName = v.bookName;
				masterId = userId;
				tx.executeSql(
					"INSERT INTO book(bookName, masterId) VALUES (?,?);", [bookName, masterId],
					function onSuccess() {//run if SQL succeeds
						console.log("book테이블에 회계정보 받아와서 넣었당~~~");
						self.getMoneyFromServer(bookName);
//						console.log("share list 갱 신 ~~~~~");
//						mainpage.db.getBook(mainpage,mainpage.printBookList);
					},
					function onError(e) { //run if SQL fails
						alert("Error:" + e.message);
					}
				);
			});
		});
		
		

	},

	/**
	 * At share page
	 * when refresh button is clicked
	 * the sharing account book list where user is a member appears
	 * @param db
	 */
	refreshFromServer : function refreshFromServer(mainpage,db){
		console.log("Test with "+mainpage.userid);
		var self = db;
//		var userId = "clara";
		var userId = mainpage.userid;
		$.ajax({
				url: "http://localhost:3000/refresh/"+userId,
				crossDomain : true,
				success: function(result){
            		console.log(result);
            		self.shareBookInfo(self,userId,result);
				},
			    error: function(xhr) {
			        console.log('실패 - ', xhr);
			     }
       	});
	},

	/**
	 * At share page
	 * Show the sharing account book list
	 * that the user is a member
	 * @param mainpage
	 * @param printList
	 */
	getBook : function getBook(mainpage,printList){
        db=this.db;
        db.transaction(function(t){
          t.executeSql("SELECT bookName, masterId FROM book",[],
            function(tran, r) {
              var bookList = [];
              var book = {};
              for (var i = 0; i < r.rows.length; i++) {
                var row = r.rows.item(i);
                var bookName = row.bookName;
                if(bookName==="My Account Book"){
                  var masterid = row.masterId;
                }
                book = {
                  'bookName' : bookName,
                  'masterid' : masterid
                }
                bookList.push(book);
              }
              printList(mainpage,bookList);
            }, function(t, e) {
                alert("Error:" + e.message);
              }
            );
        });
      },

	/**
	 * Set user's own id
	 * @param userId
	 */
	setID : function setId(userId){
		var db = this.db;
		db.transaction(function(tx){
			tx.executeSql(
				"INSERT INTO user(userId) VALUES (?);",	[userId],
				function onSuccess() {//run if SQL succeeds
					console.log("userId 받아와서 user 테이블에 넣었당~~~");
				},
				function onError(e) { //run if SQL fails
					alert("Error:" + e.message);
				}
			);
		});
	},

	/**
	 * Get user's own id
	 * for checking if user has an id
	 * @param mainpage
	 */
	getID : function getID(mainpage){
		var db = this.db;
		db.transaction(function(tx){
			tx.executeSql(
				"SELECT userId FROM user;",	[],
				function(tran, r) {
				    for (var i = 0; i < r.rows.length; i++) {
				        var row = r.rows.item(i);
				        var userId = row["userId"];
				        console.log(userId);

				    }
				    mainpage.userid=userId;
				},function(tx,e){
                    alert("You need new ID");
                }
			);
		});
	}




  }
}());
