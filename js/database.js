var GoldLucksDB={};
var db;
$(document).ready(function(){
	$("#addExpense").click(function(){
		GoldLucksDB.insertData("fromExpense");
	});
	
	$("#addIncome").click(function(){
		GoldLucksDB.insertData("fromIncome");
	});
	
	var catId=1;
	$("#select1").change(function(){
		catId = $(this).val();
	});
	
	var methodId = 1;
	$("#radio1, #radio2").click(function(){
		methodId = this.id;
		if(methodId === "radio2")
			methodId = 2;
		else methodId = 1;
	});

    /**
     * It sets define variables for database.
     */
	//database version setting
	var version = 1.0;
	//database name setting
	var dbName = "GoldLucksDB";
	//database display name setting
	var dbDisplayName = "GoldLucksDisplay";
	//database size setting
	var dbSize = 2 * 1024 * 1024;
	
	GoldLucksDB.openDatabase = function(){
		if(window.openDatabase){
			db = openDatabase(dbName, version, dbDisplayName, dbSize);
			GoldLucksDB.createTable(db);
	        
		}else {
	        alert("Web SQL Database not supported");
		}
	};
	
	/**
	 * Gets amounts per category
	 */
	GoldLucksDB.getExpenses = function getExpenses(callBack){
		var sumPerCategory = [];
		db.transaction(function(t){
			t.executeSql("SELECT SUM(amount) AS sumAmount FROM money WHERE income=?",[0],
				function(tran, r) {
					for (var i = 0; i < r.rows.length; i++) 
						sumPerCategory.push(r.rows.item(i).sumAmount);
					callBack(sumPerCategory);
				}, function(t, e) {
					alert("Error:" + e.message);
				}
			);
		});
	};
	
	/**
	 * Gets total expense from the money table
	 */
	GoldLucksDB.getTotalExpense = function getTotalExpense(){
		db.transaction(function(t){
			var dateee = new Date();
			var year = dateee.getFullYear();
			var month = dateee.getMonth()+1;
			if(month<10) month = "0"+month;
			var day = dateee.getDate();
			if(day<10) day = "0"+day;
			var firstDay=year+"-"+month+"-"+"01";
			var dateString = year+"-"+month+"-"+day;
			
			t.executeSql("SELECT amount FROM money WHERE income=? AND (date >= ? AND date <= ?)",[0,firstDay, dateString],
				function(tran, r) {
					for (var i = 0; i < r.rows.length; i++) {
						var row = r.rows.item(i);
						var amount = row["amount"];
					}
				}, function(t, e) {
					alert("Error:" + e.message);
					
				}
			);
		});
	};
	
	//reads and displays values from the 'places' table
	GoldLucksDB.dataView = function dataView() {
		db.transaction(function(t) {
//			t.executeSql("SELECT * FROM money AND date('now') GROUP BY category", [], 
			var dateee = new Date();
			var year = dateee.getFullYear();
			var month = dateee.getMonth()+1;
			if(month<10) month = "0"+month;
			var day = dateee.getDate();
			if(day<10) day = "0"+day;
			var firstDay=year+"-"+month+"-"+"01";
			var dateString = year+"-"+month+"-"+day;
			
//			t.executeSql("SELECT SUM(amount) AS sumAmount FROM money WHERE income=?",[0],
					
			
			t.executeSql("SELECT SUM(amount) AS sumAmount FROM money WHERE income=? AND (date >= ? AND date <= ?) GROUP BY category",[0,firstDay, dateString],
				function(tran, r) {
					for (var i = 0; i < r.rows.length; i++) {
//						var row = r.rows.item(i);
						var newEntryRow = $("#sampleList").clone();
						newEntryRow.removeAttr("id");
						newEntryRow.removeAttr("style");
						newEntryRow.appendTo("ol");
						var amount = r.rows.item(i).sumAmount;
//						var amount = row["amount"];
//						var date = row["date"];
//						var category = row["category"];
//						var income = row["income"];
//						newEntryRow.find(".showDate").text(date);
						newEntryRow.find(".showAmount").text(amount);
//						newEntryRow.find(".showUsed").text(row.used);
//						newEntryRow.find(".showCat").text(category);
//						newEntryRow.find(".showMethod").text(row.method);
//						newEntryRow.find(".showIncome").text(income);
//						newEntryRow.find(".showMemo").text(row.memo);
						
						//data list rendering
//						html.innerHTML += " " + id + " " + date + " " + amount + " " + used + " " + memo + "<br/>";


//						if(toWhere === "page1"){ //page1
//							var innerHtml = $("#testcase").html();
//							$("#testcase").html(innerHtml + id + " " + date + " " + amount + " " + used + " " + memo+"<br/>");
//						}
					}
				}, function(t, e) {
					alert("Error:" + e.message);
				}
			);
		});
	};  
	
	GoldLucksDB.insertData = function insertData(fromWhere){
		if(fromWhere === "fromExpense"){
			var inputDate = $("#datepicker").val(),
				inputAmount = $("#eAmount").val(),
				inputused = $("#eUsed").val(),
				inputCategory = catId,
				inputMethod = methodId,
				inputMemo = $("#eMemo").val();
			
			db.transaction(function(tx){
				tx.executeSql(
					"INSERT INTO money(date, amount, used, category, method, income, memo) VALUES (?,?,?,?,?,?,?);",
					[inputDate, inputAmount, inputused, inputCategory, inputMethod, 0, inputMemo],
					function onSuccess() {//run if SQL succeeds
						GoldLucksDB.getExpenses(analysis.sumArray2Json);
					}, 
					function onError(e) { //run if SQL fails
						alert("Error:" + e.message);
					}	
				);	
			});
			
			$("#datepicker").val("");
			$("#eAmount").val("");
			$("#eUsed").val("");
			catId=1;
			methodId=1;
			$("#eMemo").val("");
		}
		
		if(fromWhere === "fromIncome"){
			var inputDate = $("#datepicker2").val(),
			inputAmount = $("#iAmount").val(),
			inputused = $("#iUsed").val(),
			inputMemo = $("#iMemo").val();
			
			db.transaction(function(tx){
				tx.executeSql(
					"INSERT INTO money(date, amount, used, income, memo) VALUES (?,?,?,?,?);",
					[inputDate, inputAmount, inputused, 1, inputMemo],
					function onSuccess() {//run if SQL succeeds
						GoldLucksDB.dataView();
					}, 
					function onError(e) { //run if SQL fails
						alert("Error:" + e.message);
					}	
				);	
			});
		}
	};
	
	GoldLucksDB.createTable = function createTable(db) {

        db.transaction(function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS book"+
            		"(bookName VARCHAR(20) PRIMARY KEY,"+
            		"masterId VARCHAR(10) NOT NULL)");
        });
        
        db.transaction(function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS user"+
            		"(userId VARCHAR(10) PRIMARY KEY," +
            		"userPwd VARCHAR(10) )");
        });

        db.transaction(function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS fixedExpenses"+
            		"(_id INTEGER PRIMARY KEY,"+
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
            		"date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,"+
            		"amount FLOAT NOT NULL,"+
            		"used VARCHAR(30) NOT NULL,"+
            		"category INT(1),"+
            		"method INT(1),"+
            		"income INT(1) NOT NULL,"+
            		"memo VARCHAR(50) )" );
        });
    };
	
    (GoldLucksDB.openDatabase());

});
