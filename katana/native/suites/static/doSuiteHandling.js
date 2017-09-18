//
//
/*
/// -------------------------------------------------------------------------------

Suite File Data Handler 

Author: 
Date: 

The functions in this module are designed specifically for handling Suite XML files
for the warrior framework. 

It is expected to work with the editSuite.html file and the calls to editSuite in 
the views.py python for Django. 
/// -------------------------------------------------------------------------------

*/
if (typeof jsonAllSuitePages === 'undefined') {
 jsonAllSuitePages = { };
} else {
	//alert("Already there...");
}
var jsonSuiteObject = []; 
var jsonTestcases = [];			// for all Cases
var mySuiteKeywordsArray = ["path","context","runtype","impact", "runmode"];
var mySuite_UI_Array = [ 'CasePath', 'CaseContext', 'CaseRuntype', 'CaseImpact', 'CaseRunmode'];
	

function getRandomSuiteID() {
  min = Math.ceil(1);
  max = Math.floor(4000);
  return Math.floor(Math.random() * (max - min)) + min;
  
}

/// -------------------------------------------------------------------------------
// Sets up the global Suite data holder for the UI. 
// This is called from the correspoding HTML file onLoad event 
// or when a new XML file is loaded into the interface.
// 
// Two variables are set when this function is called; 
// 1. jsonSuiteObject 
// 2. jsonTestcases is set to point to the Testcases data structure in
//    the jsonSuiteObject
//
/// -------------------------------------------------------------------------------
function mapFullSuiteJson(myobjectID){
	//console.log('Mapping data ... ' + typeof(sdata) + ' is [' + sdata + "] " + sdata.length);  // This jdata is a string ....
	
	var sdata = katana.$activeTab.find("#listOfTestcasesForSuite").text();
	katana.$activeTab.find("#listOfTestcasesForSuite").hide();
	katana.$activeTab.find("#savefilepath").hide();

	var jdata = sdata.replace(/'/g, '"');
	console.log('Mapping data ... ' + typeof(sdata) + ' is [' + sdata + "] " + sdata.length);  // This jdata is a string ....
	jsonAllSuitePages[myobjectID] = JSON.parse(sdata); 
	//jsonAllSuitePages[myobjectID] = JSON.parse(jdata); 
	//alert(JSON.parse(sdata));
	console.log(typeof(jsonAllSuitePages[myobjectID]));
	jsonSuiteObject =  jsonAllSuitePages[myobjectID]; 
	jsonTestcases = jsonSuiteObject['Testcases']; 
	mapSuiteJsonToUi(jsonTestcases);  // This is where the table and edit form is created. 
} 

function createNewCaseForSuite() {

		var newTestcase = {	
		"Step" : { "@Driver": "", "@keyword": "", "@TS": "1" },
		"Arguments": { "Argument" :  "" },
		"onError" :  "",
		"onError": { "@action": "next", "@value": "" }, 
		"ExecType": { "@ExecType": "Yes"},
		"context": "",
		"impact": ""
		};
	return newTestcase;
}

/// -------------------------------------------------------------------------------
// Dynamically create a new Testcase object and append to the jsonTestcases 
// array. Default values are used to fill in a complete structure. If there is 
// no default value, a null value is inserted for the keyword
/// -------------------------------------------------------------------------------
function addCaseToSuite(){
	var newTestcase =createNewCaseForSuite();
		//"path": "../Cases/framework_tests/seq_par_execution/seq_ts_seq_tc.xml", 
	 	//"runmode": {"@type": "ruf", "@value": "2"},
		//"retry": {"@type": "if not", "@Condition": "testCase_1_result", "@Condvalue": "PASS", "@count": "6", "@interval": "0"}, 
	
	if (!jQuery.isArray(jsonTestcases['Testcase'])) {
		jsonTestcases['Testcase'] = [jsonTestcases['Testcase']];
		}

	jsonTestcases['Testcase'].push(newTestcase);
	createCasesTable(jsonTestcases['Testcase']);
}

function insertCaseToSuite(sid){
	var newTestcase =createNewCaseForSuite();	
	if (!jQuery.isArray(jsonTestcases['Testcase'])) {
		jsonTestcases['Testcase'] = [jsonTestcases['Testcase']];
		}
	jsonTestcases['Testcase'].splice(sid,0,newTestcase);
	createCasesTable(jsonTestcases['Testcase']);
}

function mapSuiteCaseToUI(s,xdata,popup) {

	// This is called from an event handler ... 
	console.log(xdata);
	console.log(s);
	var oneCase = xdata[s];
	console.log(oneCase);
	console.log(oneCase['path']);
	popup.find("#CaseRowToEdit").val(s); 
	console.log(popup.find("#CaseRowToEdit").val());
	//katana.$activeTab.find("CasePath").val(oneCase['path']);
	
	var myStringArray = mySuiteKeywordsArray; 
	var arrayLength = mySuiteKeywordsArray.length;
	for (var xi = 0; xi < arrayLength; xi++) {
		console.log("Fill "+ mySuite_UI_Array[xi]);
			var xxx = "#"+mySuite_UI_Array[xi];
			popup.find(xxx).val(oneCase[myStringArray[xi]]); 
		}

	if (! oneCase['onError']) {
			oneCase['onError'] = { "@action": "next", "@value": "" };
		}

	if (! oneCase['Execute']) {
			oneCase['Execute'] = { "@ExecType": "Yes", "@value": "" };
		}

	
}


/// -------------------------------------------------------------------------------
// This function is called to map the currently edited Suite Case to 
// the field being edited. 
// Note that this function is calld from an event handler which catches the 
// row number from the table.
/// -------------------------------------------------------------------------------
function mapUItoSuiteCase(popup,xdata){

		
	var s = parseInt(popup.find("#CaseRowToEdit").val());
	console.log(xdata);
	console.log(s);
	var oneCase = xdata[s];
	var id = s; // katana.$activeTab.find("#CaseRowToEdit").val();
	console.log(oneCase);
	
		id = '#CaseImpact'
		oneCase['impact'] = popup.find(id).val();

		id = '#CasePath'		
		oneCase['path'] = popup.find(id).val();

		id = '#CaseContext'
		oneCase['context'] = popup.find(id).val();

		id = '#CaseRuntype'
		oneCase['runtype'] = popup.find(id).val();

		id = '#CaseRunmode'
		oneCase['runmode'] = popup.find(id).val();

		id = "#onError-at-action"
		oneCase['onError']['@action'] = popup.find(id).val();

	
}

/*
Collects data into the global Suite data holder from the UI and returns the XML back 
NOTE: At the time of writing I am using jQuery and Bootstrap to show the data.

Two global variables are heavily used when this function is called; 
1. jsonSuiteObject 
2. jsonTestcases which is set to point to the Testcases data structure in
   the jsonSuiteObject

*/
function mapUiToSuiteJson() {

	if (katana.$activeTab.find("#suiteName").val().length < 1) {
		alert("Please specify a Suite name");
		return
	}
	if (katana.$activeTab.find("#suiteTitle").val().length < 1) {
		alert("Please specify a Suite title");
		return
	}

	if (katana.$activeTab.find("#suiteEngineer").val().length < 1) {
		alert("Please specify a Suite Engineer");
		return
	}

	
	
	jsonSuiteObject['Details']['Name'] = katana.$activeTab.find('#suiteName').val();
	jsonSuiteObject['Details']['Title'] = katana.$activeTab.find('#suiteTitle').val();
	jsonSuiteObject['Details']['Engineer'] = katana.$activeTab.find('#suiteEngineer').val();
	jsonSuiteObject['Details']['Resultsdir'] = katana.$activeTab.find('#suiteResults').val();
	jsonSuiteObject['Details']['Date'] = katana.$activeTab.find('#suiteDate').val();
	jsonSuiteObject['Details']['default_onError'] = katana.$activeTab.find('#defaultOnError').val();
	jsonSuiteObject['Details']['Datatype']['@exectype'] = katana.$activeTab.find('#suiteDatatype').val();
	jsonSuiteObject['SaveToFile'] = katana.$activeTab.find('#my_file_to_save').val();

	console.log(jsonSuiteObject['Testcases']);
	var url = "./suites/getSuiteDataBack";
	var csrftoken = $("[name='csrfmiddlewaretoken']").val();

	$.ajaxSetup({
			function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken)
    	}
	});
	
	var topNode  = { 'Suite' : jsonSuiteObject};

	
	//alert(ns);

	$.ajax({
	    url : url,
	    type: "POST",
	    data : { 
	    	'json': JSON.stringify(topNode),
	    	
	    	'filetosave': $('#my_file_to_save').val(),
	    	'savefilepath': katana.$activeTab.find('#savefilepath').text()
	    	},
	    headers: {'X-CSRFToken':csrftoken},
    
    success: function( data ){
        alert("Saved it");
    	}
	});

}



//
// This creates the table for viewing data in a sortable view. 
// 
function createCasesTable(xdata) {
	var items = []; 

	items.push('<table id="Case_table_display" class="configuration_table" width="100%">');
	items.push('<thead>');
	items.push('<tr id="CaseRow"><th>Num</th><th>Path</th><th>context</th><th>OnError</th><th>Impact</th><th/><th/></tr>');
	items.push('</thead>');
	items.push('<tbody>');

	console.log(xdata);
	katana.$activeTab.find("#tableOfTestcasesForSuite").html("");
	for (var s=0; s<Object.keys(xdata).length; s++ ) {
		var oneCase = xdata[s];

		console.log(oneCase);
		fillCaseDefaults(s,xdata);
		var showID = parseInt(s)+ 1; 
		items.push('<tr data-sid="'+s+'"><td>'+showID+'</td>');
		
		items.push('<td>'+oneCase['path']+'</td>');
		items.push('<td>'+oneCase['context']+'</td>');
		//items.push('<td>'+oneCase['datafile']+'</td>');

		items.push('<td>'+oneCase['runtype']+'</td>');
		items.push('<td>'+oneCase['runmode']+'</td>');
		items.push('<td>'+oneCase['onError']['@action']+'</td>');
		items.push('<td>'+oneCase['impact']+'</td>');

		var bid = "deleteTestcase-"+s+"-id"+getRandomSuiteID();
		items.push('<td><i title="Delete" class="delete-item-32" id="'+bid+'"/>');
		katana.$activeTab.find('#'+bid).off('click');  // unbind is deprecated - debounces the click event. 
		$(document).on('click','#'+bid,function( ) {
			var names = this.id.split('-');
			var sid = parseInt(names[1]);
			removeTestcase(sid,xdata);
		});
		bid = "editTestcaseRow-"+s+"-id"+getRandomSuiteID();
		//items.push('<td><input type="button" class="btn" value="Edit" id="'+bid+'"/></td>');
		items.push('<i title="Edit" class="edit-item-32" title="Edit" id="'+bid+'"/> ');
		katana.$activeTab.find('#'+bid).off('click');  // unbind is deprecated - debounces the click event. 
		$(document).on('click','#'+bid,function(  ) {
			var names = this.id.split('-');
			var sid = parseInt(names[1]);
			console.log("xdata --> "+ xdata);
			//alert("mapSuiteCaseToUI");
			katana.popupController.open(katana.$activeTab.find("#editTestCaseEntry").html(),"Edit..." + sid, function(popup) {
				mapSuiteCaseToUI(sid,xdata,popup);
			});
			
			//This is where you load in the edit form and display this row in detail. 
		});
		bid = "insertTestcase-"+s+"-id"+getRandomSuiteID();
		//items.push('<td><input type="button" class="btn" value="Edit" id="'+bid+'"/></td>');
		items.push('<i title="Edit" class="add-item-32" title="Insert New Case" id="'+bid+'"/></td>');
		katana.$activeTab.find('#'+bid).off('click');  // unbind is deprecated - debounces the click event. 
		$(document).on('click','#'+bid,function(  ) {
			var names = this.id.split('-');
			var sid = parseInt(names[1]);
			console.log("xdata --> "+ xdata);
			insertCaseToSuite(sid);
			//mapSuiteCaseToUI(sid,xdata);
			//This is where you load in the edit form and display this row in detail. 
		});
		items.push('</tr>');
	}
	items.push('</tbody>');
	items.push('</table>');
	katana.$activeTab.find("#tableOfTestcasesForSuite").html( items.join(""));
	katana.$activeTab.find('#Case_table_display tbody').sortable( { stop: testSuiteSortEventHandler});
	//katana.$activeTab.find('#Case_table_display').on('click',"td",   function() { 
	//});



}


//
var testSuiteSortEventHandler = function(event, ui ) {
	var listItems = [] ; 
	var listCases = katana.$activeTab.find('#Case_table_display tbody').children(); 
	console.log(listCases);

	var oldCaseSteps = jsonSuiteObject["Testcases"]['Testcase'];
	var newCaseSteps = new Array(listCases.length);
		
	for (xi=0; xi < listCases.length; xi++) {
		var xtr = listCases[xi];
		var ni  = xtr.getAttribute("data-sid");
		console.log(xi + " => " + ni);
		newCaseSteps[ni] = oldCaseSteps[xi];
	}

	jsonSuiteObject["Testcases"]['Testcase'] = newCaseSteps;
	jsonTestcases = jsonSuiteObject['Testcases']; 
	mapSuiteJsonToUi(jsonTestcases);  // This is where the table and edit form is created. 
};




function fillCaseDefaults(s, data){
		oneCase = data[s]
		console.log(data);
		if (oneCase == null) {
			data[s] = {} ;
			oneCase = data[s];
		}
		var myStringArray = mySuiteKeywordsArray; // ["path","context","runtype","impact", "runmode"];
		var arrayLength = myStringArray.length;
		for (var xi = 0; xi < arrayLength; xi++) {
   				if (! oneCase[myStringArray[xi]]){
						oneCase[myStringArray[xi]] = myStringArray[xi];
					}
   				
		}

		if (! oneCase['onError']) {
			oneCase['onError'] = { "@action": "next", "@value": "" };
		}
		oneCase['Execute'] = { "@ExecType": "Yes", "@value": "" };
		
}


function createRequirementsTable(rdata){
	var items =[]; 
	katana.$activeTab.find("#tableOfTestRequirements").html("");
	
	items.push('<table id="Case_table_display" class="configuration_table" width="100%" >');
	items.push('<thead>');
	items.push('<tr id="ReqRow"><th>Num</th><th>Name</th><th>Value</th><th/><th/></tr>');
	items.push('</thead>');
	items.push('<tbody>');
	console.log(rdata);
	for (var s=0; s<Object.keys(rdata).length; s++ ) {
		var oneReq = rdata[s];
		var idnumber = s + 1
		items.push('<tr data-sid=""><td>'+idnumber+'</td>');
		//items.push('<td>'+oneReq+'</td>');
		var bid = "textRequirement-name-"+s+"-id";	
		items.push('<td><input type="text" value="'+oneReq['@name']+'" id="'+bid+'"/></td>');
		bid = "textRequirement-value-"+s+"-id";	
		items.push('<td><input type="text" value="'+oneReq['@value']+'" id="'+bid+'"/></td>');
		console.log("Line 328 or so"); 
		bid = "deleteRequirement-"+s+"-id"+getRandomSuiteID();
		console.log("Line 328 or so "+bid); 
		items.push('<td><i  class="delete-item-32"  title="Delete" id="'+bid+'"/>');
		katana.$activeTab.find('#'+bid).off('click');  // unbind is deprecated - debounces the click event. 
		$(document).on('click','#'+bid,function( event ) {
			var names = this.id.split('-');
			var sid = parseInt(names[1]);
			console.log("Remove " + sid + " " + this.id +" from " + rdata); 
			jsonSuiteObject['Requirements'].splice(sid,1);
			createRequirementsTable(jsonSuiteObject['Requirements']);	
			return false;
		});

				console.log("Line 344 or so"); 

		bid = "editRequirement-"+s+"-id"+getRandomSuiteID();
		items.push('<i class="edit-item-32" title="Save Edit" id="'+bid+'"/>');
		katana.$activeTab.find('#'+bid).off('click');  // unbind is deprecated - debounces the click event. 
		$(document).on('click','#'+bid,function(  ) {
			var names = this.id.split('-');
			var sid = parseInt(names[1]);
			console.log("xdata --> "+ rdata);  // Get this value and update your json. 
			var txtNm = katana.$activeTab.find("#textRequirement-name-"+sid+"-id").val();
			var txtVl = katana.$activeTab.find("#textRequirement-value-"+sid+"-id").val();
			console.log("Editing ..." + sid);
			console.log(jsonSuiteObject['Requirements'][sid])
			jsonSuiteObject['Requirements'][sid]  = { "@name": txtNm, "@value": txtVl};
			createRequirementsTable(jsonSuiteObject['Requirements']);	
			event.stopPropagation();
			//This is where you load in the edit form and display this row in detail. 
		});

		bid = "insertRequirement-"+s+"-id"+getRandomSuiteID();
		items.push('<i class="add-item-32"  title="Insert" id="'+bid+'"/></td>');
		katana.$activeTab.find('#'+bid).off('click');  // unbind is deprecated - debounces the click event. 
		$(document).on('click','#'+bid,function( event ) {
			var names = this.id.split('-');
			var sid = parseInt(names[1]);
			console.log("Insert" + sid + " " + this.id +" from " + rdata); 
			insertRequirementToSuite(sid);

			createRequirementsTable(jsonSuiteObject['Requirements']);	
			return false;
		});


	}
	items.push('</tbody>');
	items.push('</table>');

	katana.$activeTab.find("#tableOfTestRequirements").html( items.join(""));
	//katana.$activeTab.find('#tableOfTestRequirements').sortable();
	

}


function removeRequirement(s,rdata){
	console.log(rdata);
	rdata.splice(s,1);
			
}
/*
// Shows the global Suite data holder in the UI.

NOTE: At the time of writing I am using jQuery and Bootstrap to show the data.

Two global variables are heavily used when this function is called; 
1. jsonSuiteObject 
2. jsonTestcases which is set to point to the Testcases data structure in
   the jsonSuiteObject

*/
function mapSuiteJsonToUi(data){
	var items = []; 
	var xdata = data['Testcase'];
	if (!jQuery.isArray(xdata)) xdata = [xdata]; 

	if (!data['Requirements']) data['Requirements'] = [];
	var rdata = data['Requirements'];
	if (!jQuery.isArray(rdata)) rdata = [rdata]; 

	createCasesTable(xdata);
	createRequirementsTable(rdata);
	katana.$activeTab.find('#editTestcase').off('click');  // unbind is deprecated - debounces the click event. 
	katana.$activeTab.find('#editTestcase').on('click',function() {

		});

}  // end of function 

function saveSuitesCaseUI() {
		var xdata = jsonTestcases['Testcase'];
		var popup = $(this).closest('.popup');
		mapUItoSuiteCase(popup,xdata);
		createCasesTable(xdata);  //Refresh the screen.
		console.log('Closing');
		katana.popupController.close(popup);
}
function insertRequirementToSuite( sid) {

			console.log("Add Requirement... ");
			if (!jsonSuiteObject['Requirements']) jsonSuiteObject['Requirements'] = [];
			rdata = jsonSuiteObject['Requirements'];
			
			var newReq = {"Requirement" : { "@name": "", "@value": ""},};
			rdata.splice(sid - 1, 0, newReq); 
			console.log(jsonSuiteObject);
			createRequirementsTable(jsonSuiteObject['Requirements']);	
			//event.stopPropagation();

}

function addRequirementToSuite() {

			console.log("Add Requirement... ");
			if (!jsonSuiteObject['Requirements']) jsonSuiteObject['Requirements'] = [];
			rdata = jsonSuiteObject['Requirements'];
			rdata.push({"Requirement" : { "@name": "", "@value": ""},});
			console.log(jsonSuiteObject);
			createRequirementsTable(jsonSuiteObject['Requirements']);	
			//event.stopPropagation();

}


// Removes a test Case by its ID and refresh the page. 
function removeTestcase( sid,xdata ){
	jsonTestcases['Testcase'].splice(sid,1);
	console.log("Removing test Cases "+sid+" now " + Object.keys(jsonTestcases).length);
	mapSuiteJsonToUi(jsonTestcases);	// Send in the modified array
}
