function Main(){
  this.moneys=[];
  this.money={};
  this.db = new GoldLucksDB();
  this.db.init();
  this.analysis = new Analysis(this.db);
  this.userid;
  this.currentBook="My Account Book";
}

Main.prototype={
  init: function Main_init(){
    var db = this.db;
        this.compute();
        $('#mainMonth').html(this.year + '-' + this.month);
        $('#mainbookName').html(this.currentBook);
        db.getMoney(this.firstDay,this.lastDay,this.printMoney,this);
        db.getTotalExpense(this);
        this.getId(this);
        console.log('init():'+this.userid);
  },

  compute : function Main_compute_date(){
        this.date = new Date(),
        this.year = this.date.getFullYear(),
        this.month = this.date.getMonth() + 1,
        this.eDay = (new Date(this.year, this.month, 0)).getDate();
        if(this.month<10)
          this.month='0'+this.month;
        this.firstDay = this.year+"-"+this.month+"-"+"01",
        this.lastDay = this.year+"-"+this.month+"-"+this.eDay;
        this.today = new Date();
  },

  printMoney: function Main_print_money(moneys){
        var mainList = $('#cd-timeline');
        mainList.empty();
        var time,
            money,
            check;
        if(moneys!==undefined){
          for (var i = this.eDay; i >= 0; i--) {
            check=0;
            for(var j in this.moneys){
              money = this.moneys[j];
              time=money.date.split('-');
              if(parseInt(time[2])===i){
                //this is the first time to insert money to i-th day
                if(check===0){
                  mainList.append('<div class="cd-timeline-block" id="block' + i + '"></div>');
                  $('.cd-timeline-block#block' + i).append('<div class="cd-timeline-img" id="img' + i + '"></div>', '<div class="cd-timeline-content"id="content' + i + '"></div>');
                  $('div[id="img' + i + '"]').append('<span class="cd-date">' + i + '</span>');
                  $('.cd-timeline-content#content' + i).append('<ul data-role="listview" id="ul' + i + '"></ul>');
                  check=1;
                }
                if(check===1){
                  if(money.income===0){//in case of expense
                    $('ul[id="ul' + i + '"]').append('<li>'+money.used+'<p class="ui-li-aside2">'+money.amount+'$</p></li>');
                    $('ul[id="ul' + i + '"]').listview().listview('refresh');
                    console.log("find expense money in moneyList");
                  }
                  if(money.income===1){//in case of income
                    $('ul[id="ul' + i + '"]').append('<li>'+money.used+'<p class="ui-li-aside1">'+money.amount+'$</p></li>');
                    $('ul[id="ul' + i + '"]').listview().listview('refresh');
                    console.log("find income money in moneyList");
                  }
                }
              }
            }
          }
        }else{
          var today = this.today.getDate();
          mainList.append('<div class="cd-timeline-block" id="block' + today + '"></div>');
          $('.cd-timeline-block#block' + today).append('<div class="cd-timeline-img" id="img' + today + '"></div>', '<div class="cd-timeline-content"id="content' + today + '"></div>');
          $('div[id="img' + today + '"]').append('<span class="cd-date">' + today + '</span>');
          $('.cd-timeline-content#content' + today).append('<ul data-role="listview" id="ul' + today + '"></ul>');
          $('ul[id="ul' + today + '"]').append("<li><h1>Please insert today's money list!</h1><p class='ui-li-aside'></p></li>");
          $('ul[id="ul' + today + '"]').listview().listview('refresh');
          console.log('nothing in money DB yet');
        }
  },

  printTotal : function printTotal(){
	var tIncome = this.db.tIncome;
	var tExpense = this.db.tExpense;
	console.log(typeof(tIncome));
	console.log(typeof(tExpense));
    this.db.total = tIncome - tExpense;
    console.log(this.db.total);
    $('#Balance').html('Balance '+this.db.total).append('<p id="total" class="ui-li-aside">+'+tIncome+' -'+tExpense);
  },

  getData : function get_input(fromWhere){
    var money={};
    if(fromWhere==="fromExpense"){
      money.date = $("#datepicker").val();
  		money.amount = $("#eAmount").val();
  		money.used = $("#eUsed").val();
  		money.category = $("#select1>option:selected").val();
  		money.method = $("input:radio[name='radio1']:checked").val();
  		money.memo = $("#eMemo").val();
    }
    if(fromWhere==="fromIncome"){
      money.date = $("#datepicker2").val();
      money.amount = $("#iAmount").val();
      money.used = $("#iUsed").val();
      money.memo = $("#iMemo").val();
    }
    return money;
  },

  setId : function setId(userid){
    var db = this.db;
    db.setID(userid);
    this.userid=userid;
    // if(this.userid===undefined){
    //   this.userid=userid;
    // }else{
    //   alert('You already have your own ID :'+this.userid);
    // }
  },

  getId : function getId(){
	  var db = this.db;
	  console.log(db);
	  db.getID(this);
//    if(this.userid!==undefined){
//      return this.userid;
//    }else{
//      alert('You need new ID');
//    }
  },

  printBookList : function printBookList(mainpage,bookList){
    var bookName,
        masterid;
    var self=mainpage;
    $('#shareList>li:gt(1)').remove();
    for(var i in bookList){
      bookName = bookList[i].bookName;
      masterid = bookList[i].masterid;
      if(bookName!=="My Account Book"){
        $("#shareList").append('<li class="shareL" value="'+bookName+'"><a href="#mainpage"><i class = "ui-icon-"></i>'+bookName+'</a>');
        $("#shareList").listview('refresh');
      }
    }
    $('.shareL').click(function(){
      var bookname = $(this).text();
      console.log(bookname);
      console.log(self);
      self.currentBook = bookname;
      self.init();
      $.mobile.changePage('#mainpage');
    });
  },
  printBookList2 : function printBookList(mainpage,bookList){
	    var bookName,
	        masterid;
	    var self=mainpage;
	    $('#shareList2>li:gt(1)').remove();
	    for(var i in bookList){
	      bookName = bookList[i].bookName;
	      masterid = bookList[i].masterid;
	      if(bookName!=="My Account Book"){
	        $("#shareList2").append('<li class="shareL2" value="'+bookName+'"><a href="#mainpage"><i class = "ui-icon-"></i>'+bookName+'</a>');
	        $("#shareList2").listview('refresh');
	      }
	    }
	    $('.shareL2').click(function(){
	      var bookname = $(this).text();
	      console.log(bookname);
	      console.log(self);
	      self.currentBook = bookname;
	      self.init();
	      $.mobile.changePage('#mainpage');
	    });
	  }
}



 $(document).ready(function(){
  $("#mainpage").on('pagebeforeshow',function(){
    //mainpage.init();
  });

  $('#page1,#page2').on('pagebeforeshow',function(){
    $("#datepicker").val("");
		$("#eAmount").val("");
		$("#eUsed").val("");
		catId=0;
		methodId=1;
		$("#eMemo").val("");
  });

  $("#addExpense").click(function(){
    var money = {};
    money = mainpage.getData("fromExpense");
    mainpage.db.insertData("fromExpense",money,mainpage.currentBook);
    mainpage.init();
  });

  $("#addIncome").click(function(){
    var money = {};
    money = mainpage.getData("fromIncome");
    mainpage.db.insertData("fromIncome",money,mainpage.currentBook);
    mainpage.init();
  });


  $("#analysis").on('pagebeforeshow',function(){
    var catArr=[];
    $("#select1").find("option").each(function() {
        catArr.push($(this).text());
    });
    //mainpage.analysis.init();
    mainpage.analysis.catArr = catArr;
    mainpage.db.getExpenses(mainpage.analysis.catNum2Text,mainpage.analysis);
  });

  $('#sharebtn').click(function(){
    var userid = mainpage.userid;
    var bookName = $('#sbook').val();
    var groupName = $('#sGroup').val();
    var shareWith = $('#with1').val();
    console.log(userid);
    if(userid!==undefined){
      mainpage.db.insertBook(bookName,userid);
      mainpage.db.shareBook(bookName,groupName,userid,shareWith);
 //     mainpage.db.sendShareBook(bookName,userid,shareWith);
      $.mobile.changePage('#share');
    }else{
      $.mobile.changePage('#setting');
      alert('You need new ID');
    }
  });

  $('#share').on('pagebeforeshow',function(){
    mainpage.db.getBook(mainpage,mainpage.printBookList);
  });
  
  $('#share2').on('pagebeforeshow',function(){
	    mainpage.db.getBook(mainpage,mainpage.printBookList2);
	  });

  $('#signbtn').click(function(){
    var userid = $('#un').val();
    if(mainpage.userid===undefined){
      if(userid!==undefined){
        mainpage.setId(userid);
        alert('Your id is "'+userid+'"');
      }
    }else{
      alert('You have already your ID'+mainpage.userid);
    }
  });


  var mainpage = new Main();
  mainpage.init();



  	$('#refreshbtn').click(function(){
  		mainpage.db.refreshFromServer(mainpage,mainpage.db);
  		
  	});

});
