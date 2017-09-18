/*
/// -------------------------------------------------------------------------------

Case File Data Handler 

Author: 
Date: 

The functions in this module are designed specifically for handling Suite XML files
for the warrior framework. 

It is expected to work with the editCase.html file and the calls in 
the views.py python for Django. 
/// -------------------------------------------------------------------------------

*/
function getRandomCaseID() {
  min = Math.ceil(1);
  max = Math.floor(4000);
  return Math.floor(Math.random() * (max - min)) + min;
  
}

if (typeof jsonAllCasePages === 'undefined') {
 jsonAllCasePages = { };
} else {
	//alert("Already there...");
}

var jsonCaseObject = [];
var jsonCaseDetails = [];         // A pointer to the Details   
var jsonCaseSteps = [];           
var jsonCaseRequirements = []; 	  // This is the JSON model for the UI requirements
var activePageID = getRandomCaseID();   // for the page ID 
var jsonFilesInfo = null; 

function mapFullCaseJson(myobjectID){
	activePageID = getRandomCaseID();
	katana.$activeTab.find("#listOfTestStepsForCase").hide();
	katana.$activeTab.find('#savesubdir').hide();
	var sdata = katana.$activeTab.find("#listOfTestStepsForCase").text();
	var jdata = sdata.replace(/'/g, '"');
	jsonAllCasePages[myobjectID] = JSON.parse(sdata);               
	jsonCaseObject = jsonAllCasePages[myobjectID]
	jsonCaseSteps  = jsonCaseObject["Steps"];
	jsonCaseRequirements = jsonCaseObject['Requirements'];
	//if (!jQuery.isArray(jsonCaseRequirements)) jsonCaseObject['Requirements'] = []; 
	jsonCaseRequirements = jsonCaseObject['Requirements'];
	jsonCaseDetails = jsonCaseObject['Details'];
	katana.$activeTab.find("#editCaseStepDiv").hide();
	katana.$activeTab.find("#tableOfTestStepsForCase").removeClass();
	katana.$activeTab.find("#tableOfTestStepsForCase").addClass('col-md-12');
	katana.$activeTab.find("#tableOfTestStepsForCase").show();
	mapCaseJsonToUi(jsonCaseSteps);
	//mapRequirementsToUI(jsonCaseRequirements);
	createRequirementsTable(jsonCaseRequirements);

	//$('#myform :checkbox').change(function()
	katana.$activeTab.find('#ck_dataPath').change(function() {
       	if (! katana.$activeTab.find('#caseDatatype').attr("disabled")) {
       
			katana.$activeTab.find('#caseDatatype').attr("disabled", "disabled");
			katana.$activeTab.find('#caseDatatype_lbl').attr("disabled", "disabled");
			katana.$activeTab.find('#caseDatatype').hide();
			katana.$activeTab.find('#caseDatatype_lbl').hide();
			katana.$activeTab.find('#caseResultsDir').attr("disabled", "disabled");
 			katana.$activeTab.find('#caseResultsDir_lbl').attr("disabled", "disabled");
 			katana.$activeTab.find('#caseResultsDir').hide();
 			katana.$activeTab.find('#caseResultsDir_lbl').hide();
 
   		 } else {
        //  This resizes the display~
			katana.$activeTab.find('#caseDatatype').removeAttr("disabled");
			katana.$activeTab.find('#caseDatatype_lbl').removeAttr("disabled");
			katana.$activeTab.find('#caseDatatype').show();
			katana.$activeTab.find('#caseDatatype_lbl').show();
			katana.$activeTab.find('#caseResultsDir').removeAttr("disabled");
			katana.$activeTab.find('#caseResultsDir_lbl').removeAttr("disabled");
			katana.$activeTab.find('#caseResultsDir').show();
 			katana.$activeTab.find('#caseResultsDir_lbl').show();
 
     	}
	});



}




function mapUiToCaseJson() {

	if ( katana.$activeTab.find('#caseName').attr('value').length < 1) {
		alert("Please specific a case name ");
		return;
	}

	if ( katana.$activeTab.find('#caseTitle').attr('value').length < 1) {
		alert("Please specific a Title ");
		return;
	}
	if ( katana.$activeTab.find('#caseEngineer').attr('value').length < 1) {
		alert("Please specific an Engineer name ");
		return;
	}

	jsonCaseObject['Details']['Name'] = katana.$activeTab.find('#caseName').attr('value');
	jsonCaseObject['Details']['Title'] = katana.$activeTab.find('#caseTitle').attr('value');
	jsonCaseObject['Details']['Category'] = katana.$activeTab.find('#caseCategory').attr('value');
	jsonCaseObject['Details']['State'] = katana.$activeTab.find('#caseState').attr('value');
	jsonCaseObject['Details']['Engineer'] = katana.$activeTab.find('#caseEngineer').attr('value');
	jsonCaseObject['Details']['Title'] = katana.$activeTab.find('#caseTitle').attr('value');
	jsonCaseObject['Details']['Date'] = katana.$activeTab.find('#caseDate').attr('value');
	//jsonCaseObject['Details']['Time'] = $('#suiteTime').attr('value');
	jsonCaseObject['Details']['default_onError'] = katana.$activeTab.find('#default_onError').attr('value');
	jsonCaseObject['Details']['Datatype'] = katana.$activeTab.find('#caseDatatype').attr('value');
	jsonCaseObject['dataPath'] =  katana.$activeTab.find('#caseInputDataFile').attr('value');
	jsonCaseObject['resultsDir'] =  katana.$activeTab.find('#caseResultsDir').attr('value');
	jsonCaseObject['logsDir'] =  katana.$activeTab.find('#caseLogsDir').attr('value');
	jsonCaseObject['expectedDir'] =  katana.$activeTab.find('#caseExpectedResults').attr('value');
	jsonCaseObject['SaveToFile'] =  katana.$activeTab.find('#my_file_to_save').attr('value');

	if (!jsonCaseObject['Requirements']) {
		jsonCaseObject['Requirements'] = []; 
	}

	saveUItoRequirements();  // Save Requirements table. 
	// Now you have collected the user components...
} 


// Saves the UI to memory and sends to server. 
function writeUitoCaseJSON() {
	mapUiToCaseJson();
	var url = "./cases/getCaseDataBack";
	var csrftoken = $("[name='csrfmiddlewaretoken']").attr('value');

	$.ajaxSetup({
			function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken)
    	}
	});

	var topNode  = { 'Testcase' : jsonCaseObject};

	$.ajax({
    url : url,
    type: "POST",
    data : { 
    	'json': JSON.stringify(topNode),	
    	'filetosave': katana.$activeTab.find('#my_file_to_save').attr('value'),
    	'savesubdir': katana.$activeTab.find('#savesubdir').text(),
    	},
    headers: {'X-CSRFToken':csrftoken},
    //contentType: 'application/json',
    success: function( data ){
        alert("Sent");
    	}
	});
}

function fillStepDefaults(oneCaseStep) {

		if (! oneCaseStep['step']){
			oneCaseStep['step'] = { "@ExecType": "Yes", 
					"Rule": { "@Condition": "", "@Condvalue": "", "@Else": "next", "@Elsevalue": "" }
				}; 
		}
		if (!oneCaseStep['step']['Rule']) {
				oneCaseStep['step']['Rule'] = { "Rule": { "@Condition": "", "@Condvalue": "", "@Else": "next", "@Elsevalue": "" } };
		}
		if (! oneCaseStep['onError']) {
			oneCaseStep['onError'] = { "@action": "next", "@value": "" };
		}
		if (! oneCaseStep['runmode']) {
			oneCaseStep['runmode'] = { "@type": "next", "@value": "" };
		}
		if (! oneCaseStep['retry']) {
			oneCaseStep['retry'] = { "@type": "next", "@Condition": "", "@Condvalue": "", "@count": "" , "@interval": ""};
		}
		if (! oneCaseStep['Arguments']) {
			oneCaseStep['Arguments'] = { 'argument': [] }
		}

}

/*

Maps the data from a Testcase object to the UI. 
The UI currently uses jQuery and Bootstrap to display the data.

*/
function mapCaseJsonToUi(data){
	//
	// This gives me ONE object - The root for test cases
	// The step tag is the basis for each step in the Steps data array object.
	// 
	var items = []; 
	var xdata = data['step'];
	if (!jQuery.isArray(xdata)) xdata = [xdata]; // convert singleton to array


	//console.log("xdata =" + xdata);
	katana.$activeTab.find("#tableOfTestStepsForCase").html("");      // Start with clean slate
	items.push('<table class="configuration_table table-striped" id="Step_table_display"  width="100%" >');
	items.push('<thead>');
	items.push('<tr id="StepRow"><th>#</th><th>Driver</th><th>Keyword</th><th>Description</th><th>Arguments</th>\
		<th>OnError</th><th>Execute</th><th>Run Mode</th><th>Context</th><th>Impact</th><th>Other</th></tr>');
	items.push('</thead>');
	items.push('<tbody>');
	for (var s=0; s<Object.keys(xdata).length; s++ ) {  // for s in xdata
		var oneCaseStep = xdata[s];             // for each step in case
		//console.log(oneCaseStep['path']);
		var showID = parseInt(s)+1;
		items.push('<tr data-sid="'+s+'"><td>'+showID+'</td>');        // ID 
		// -------------------------------------------------------------------------
		// Validation and default assignments 
		// Create empty elements with defaults if none found. ;-)
		// -------------------------------------------------------------------------
		fillStepDefaults(oneCaseStep);
	
		items.push('<td>'+oneCaseStep['@Driver'] +'</td>'); 
		var outstr; // = oneCaseStep['@Keyword'] + "<br>TS=" +oneCaseStep['@TS'] ;
		items.push('<td>'+oneCaseStep['@Keyword'] + "<br>TS=" +oneCaseStep['@TS']+'</td>'); 
	// Show arguments for each step in the UI div tag. 

			outstr =  oneCaseStep['Description'];
		items.push('<td>'+outstr+'</td>'); 

		var arguments = oneCaseStep['Arguments']['argument'];
		var out_array = [] 
		var ta = 0; 
		for (xarg in arguments) {
			var xstr =  arguments[xarg]['@name']+" = "+arguments[xarg]['@value'] + "<br>";
			//console.log(xstr);
			out_array.push(xstr); 
			ta  = ta + 1; 
			}
		outstr = out_array.join("");
		//console.log("Arguments --> "+outstr);

		items.push('<td>'+outstr+'</td>'); 
	

		outstr = oneCaseStep['onError']['@action'] 
			//"Value=" + oneCaseStep['onError']['@value']+"<br>"; 
		items.push('<td>'+oneCaseStep['onError']['@action'] +'</td>'); 
	

		outstr = "ExecType=" + oneCaseStep['step']['@ExecType'] + "<br>" + 
			"Condition="+oneCaseStep['step']['Rule']['@Condition']+ "<br>" + 
			"Condvalue="+oneCaseStep['step']['Rule']['@Condvalue']+ "<br>" + 
			"Else="+oneCaseStep['step']['Rule']['@Else']+ "<br>" +
			"Elsevalue="+oneCaseStep['step']['Rule']['@Elsevalue'];

		items.push('<td>'+outstr+'</td>'); 
		items.push('<td>'+oneCaseStep['rmt']+'</td>');
		items.push('<td>'+oneCaseStep['context']+'</td>');
		items.push('<td>'+oneCaseStep['impact']+'</td>'); 
		var bid = "deleteTestStep-"+s+"-id-"+getRandomCaseID();
		//items.push('<td><input type="button" class="btn-danger" value="X" id="'+bid+'"/>');
		items.push('<td><i class="delete-item-32" title="Delete"  value="X" id="'+bid+'" />');
		
		$('#'+bid).off('click');   //unbind and bind are deprecated. 
		$(document).on('click','#'+bid,function(  ) {
			//alert(this.id);
			var names = this.id.split('-');
			var sid = parseInt(names[1]);
			removeTestStep(sid);
		});




		bid = "addTestStepAbove-"+s+"-id-"+getRandomCaseID();
		items.push('<i  title="Insert" class="add-item-32" value="Insert" id="'+bid+'"/>');
		
		$('#'+bid).off('c<td>lick');   //unbind and bind are deprecated. 
		$(document).on('click','#'+bid,function(  ) {
			//alert(this.id);
			var names = this.id.split('-');
			var sid = parseInt(names[1]);
			addTestStepAboveToUI(sid,xdata);
		});


		bid = "editTestStep-"+s+"-id-"+getRandomCaseID();
		items.push('<i title="Edit"  class="edit-item-32" theSid="'+s+'" value="Edit/Save"  id="'+bid+'"></i></td>');
		$('#'+bid).off('click');   //unbind and bind are deprecated. 
		$('#'+bid).attr('theSid', s);  //Set tthe name
		katana.$activeTab.on('click','#'+bid,function() {
			//alert(this.id);
			var names = this.id.split('-');
			var sid = parseInt(names[1]);
			katana.popupController.open(katana.$activeTab.find("#editCaseStepDiv").html(),"Edit..." + sid, function(popup) {
				setupPopupDialog(sid,xdata,popup);
			});
		 }); 



		items.push('</tr>');

	}

	items.push('</tbody>');
	items.push('</table>'); // 
	katana.$activeTab.find("#tableOfTestStepsForCase").html( items.join(""));
	katana.$activeTab.find('#Step_table_display tbody').sortable( { stop: testCaseSortEventHandler});
	
	// Based on the options
	/*
 	katana.$activeTab.find('table#Step_table_display thead tr th').each(function(index) {
    		var thisWidth = $(this).width();
    		if ( index == 0 ) { thisWidth = 40; }
    		console.log(thisWidth + "  "+ index);
    		katana.$activeTab.find('table#Step_table_display tbody tr td').each(function(xindex) {	
    				if ( index == 0 ) { 
    					$(this).css('width',thisWidth);
    				 }

    				
    		});
  	});
	*/
  	/*
	if (jsonCaseDetails['Datatype'] == 'Custom') {
		$(".arguments-div").hide();
	} else {

		$(".arguments-div").show();
	}
	*/
	//$('#fileName').html("");
	
}  // end of function 



function 	makePopupArguments(popup,  oneCaseStep) {
	var a_items = [] ;
	var xstr;
	var bid;
	var arguments = oneCaseStep['Arguments']['argument'];
	var ta = 0; 
	var sid = parseInt(popup.find("#StepRowToEdit").attr('value'));	
	
	for (xarg in arguments) {
			//console.log(arguments[xarg]);
			a_items.push('<div class="row">');
			a_items.push('<label class="col-md-2">Name</label><input  type="text" argid="caseArgName-'+ta+'" value="'+arguments[xarg]["@name"]+'"/>');
			a_items.push('<label class="col-md-2">Value</label><input  type="text" argid="caseArgValue-'+ta+'" value="'+arguments[xarg]["@value"]+'"/>');
			// Now a button to edit or delete ... 
			bid = "deleteCaseArg-"+sid+"-"+ta+"-id"
			a_items.push('<td><i title="Delete" class="fa fa-eraser" value="X" id="'+bid+'"/>');
			
			bid = "saveCaseArg-"+sid+"-"+ta+"-id"
			a_items.push('<td><i  title="Save Argument Change" class="fa fa-pencil" value="Save" id="'+bid+'"/>');

			bid = "insertCaseArg-"+sid+"-"+ta+"-id";
			a_items.push('<td><i  title="Insert one" class="fa fa-plus" value="Save" id="'+bid+'"/>');
			
			ta += 1
			a_items.push('</div>');
		
	}
	popup.find("#arguments-textarea").html( a_items.join("\n"));	
}

function setupPopupDialog(sid,xdata,popup) {
	console.log(popup);  // Merely returns the div tag
	var dd_driver = popup.find('#StepDriver');
	console.log(dd_driver);
	oneCaseStep = xdata[sid]
	var driver = oneCaseStep[ "@Driver"]  // 
	var keyword  = oneCaseStep[ "@Keyword"]   // 
	var a_items = []; 
	console.log("---- oneCase ---- ");
	console.log(oneCaseStep["@Driver"]);
 	console.log(oneCaseStep);
	popup.attr("caseStep", oneCaseStep);
	popup.attr("sid", sid);
	jQuery.getJSON("./cases/getListOfActions").done(function(data) {
			a_items = data['actions'];
			console.log("a_items ");
			console.log(a_items);
			dd_driver.empty();  // Empty all the options....
			for (var x =0; x < a_items.length; x++) {
					dd_driver.append($('<option>',{ value: a_items[x],  text: a_items[x]}));
				}
			//console.log(dd_driver.html());
			popup.find('#StepDriver').val(oneCaseStep["@Driver"]);
	});
	//console.log(xdata);
	console.log(oneCaseStep);
	popup.find("#StepRowToEdit").attr("value",sid);

	//popup.find("#StepDriver").attr("value",oneCaseStep[ "@Driver"]);
	popup.find("#StepDriver").val(oneCaseStep[ "@Driver"]);
	console.log(popup.find("#StepDriver").val());
	//popup.find("#StepKeyword").attr("value",oneCaseStep[ "@Keyword"]);
	popup.find("#StepKeyword").val(oneCaseStep[ "@Keyword"]);

	
	//alert("Keyword = "+keyword+" driver = "+ driver + " values = "+ popup.find("#StepDriver").val(oneCaseStep[ "@Driver"]));
	popup.find("#StepTS").attr("value",oneCaseStep["@TS"]);
	popup.find("#StepDescription").attr("value",oneCaseStep["Description"]);
	popup.find("#StepContext").attr("value",oneCaseStep["context"]);
	popup.find("#SteponError-at-action").attr("value",oneCaseStep['onError']["@action"]);
	popup.find("#SteponError-at-value").attr("value",oneCaseStep['onError']["@value"]);
	popup.find("#runmode-at-type").attr("value",oneCaseStep["runmode"]["@type"]);
	popup.find("#StepImpact").attr("value",oneCaseStep["impact"]);
	

	//katana.popupController.updateActiveWindow(popup);

	makePopupArguments(popup, oneCaseStep);

	// Now  set the callbacks once the DOM has new HTML elements in it.
	var arguments = oneCaseStep['Arguments']['argument'];

	var ta = 0; 
	for (xarg in arguments) {

			var bid = "deleteCaseArg-"+sid+"-"+ta+"-id"
			popup.find('#'+bid).on('click','#'+bid,function( ) {
				var names = this.id.split('-');
				var sid = parseInt(names[1]);
				var aid = parseInt(names[2]);
				removeOneArgument(sid,aid,popup);
			});
			bid = "saveCaseArg-"+sid+"-"+ta+"-id"
			popup.find('#'+bid).on('click',function( ) {
				var names = this.id.split('-');
				var sid = parseInt(names[1]);
				var aid = parseInt(names[2]);
				saveOneArgument(sid,aid,popup);
			});

			bid = "insertCaseArg-"+sid+"-"+ta+"-id";
			popup.find('#'+bid).on('click',function( ) {
				var names = this.id.split('-');
				var sid = parseInt(names[1]);
				var aid = parseInt(names[2]);
				insertOneArgument(sid,aid,popup);
			});
			ta += 1
	}
	
	popup.find('#appendArgument').on('click',function( ) {
				alert("add One Argument");
				var sid = popup.find('#StepRowToEdit').attr('value');
				var xdata =  popup.find('#StepRowToEdit').attr('xdata');
				addOneArgument(sid,xdata, popup);
			});
	
	// Fill in the value based on keyword and action 
	var opts = jQuery.getJSON("./cases/getListOfComments/?driver="+driver+"&keyword="+keyword).done(function(data) {
 			a_items = data['fields'];
 			console.log(a_items);

 			out_array = a_items[0]['comment'];
 			var outstr = out_array.join("<br>");
 			console.log(outstr);

 			popup.find("#sourceFileText").html(""); 
 			popup.find("#sourceFileText").html(outstr);

 			popup.find("#sourceFileText").addClass("willnotrender");
 			
 			popup.find("#sourceFileText").removeClass("willnotrender");
 			
 		});
	
	popup.find("#StepDriver").on('change',function() {
			sid  = popup.find("#StepDriver").attr('theSid');   // 
		var oneCaseStep = jsonCaseSteps['step'][sid];
		console.log(oneCaseStep);
		//console.log("------");
		console.log(popup.find("#StepDriver").val());

		var driver =popup.find("#StepDriver").val();
		var xopts = jQuery.getJSON("./cases/getListOfKeywords/?driver="+driver).done(function(data) {
 			popup.find("#StepKeyword").empty();
 			a_items = data['keywords'];
 			console.log(xopts);
 			console.log(a_items);
 			for (let x of a_items) {
 				popup.find("#StepKeyword").append($('<option>',{ value: x,  text: x }));
 			}
 		});
	});

	popup.find("#StepKeyword").on('change',function() {
		sid  = popup.find("#StepKeyword").attr('theSid');   // 
		var oneCaseStep = jsonCaseSteps['step'][sid];
		var keyword = popup.find("#StepKeyword").val();  // 
		var driver  = popup.find("#StepDriver").val();   // 
		var xopts = jQuery.getJSON("./cases/getListOfComments/?driver="+driver+"&keyword="+keyword).done(function(data) {
 			console.log(data);

 			a_items = data['fields'];
 			console.log(a_items);
 			out_array = a_items[0]['comment'];
 			var outstr = out_array.join("<br>");
 			var hhh = popup.find("#sourceCaseFileText");
 			//console.log('hello', hhh, keyword, driver);
	
 			hhh.empty(); 
 			hhh.append(outstr);
 			
 		});
	});

	popup.find('#saveEditCaseStep').on('click',function(  ) {

			var sid = parseInt(popup.find("#StepRowToEdit").attr('value'));	
		
			mapUItoTestStep(sid,xdata,popup);	
			//katana.popupController.close();  <-- NO
			//katana.popupController.closePopup(); <-- No
			//katana.popupController.close(popup); <--- Yes. 
			mapCaseJsonToUi(jsonCaseSteps);
		
		});

	popup.find('#editCaseStepClose').on('click',function(  ) {
			katana.popupController.close(popup);
			mapCaseJsonToUi(jsonCaseSteps);
		});

}


var testCaseSortEventHandler = function(event, ui ) {

	var listItems = [] ; 
	var listCases = katana.$activeTab.find('#Step_table_display tbody').children(); 
	console.log(listCases);

	var oldCaseSteps = jsonCaseObject["Steps"]['step'];
	var newCaseSteps = new Array(listCases.length);
		
	for (xi=0; xi < listCases.length; xi++) {
		var xtr = listCases[xi];
		var ni  = xtr.getAttribute("data-sid");
		console.log(xi + " => " + ni);
		newCaseSteps[ni] = oldCaseSteps[xi];
	}

	jsonCaseObject["Steps"]['step'] = newCaseSteps;
	jsonCaseSteps  = jsonCaseObject["Steps"]
	mapCaseJsonToUi(jsonCaseSteps);
	
};

// Removes a test suite by its ID and refresh the page. 
function removeTestStep( sid ){
		jsonCaseSteps['step'].splice(sid,1);
		console.log("Removing test cases "+sid+" now " + Object.keys(jsonCaseSteps).length);
		mapCaseJsonToUi(jsonCaseSteps);
}

function addTestStepAboveToUI(sid,xdata) {
	var newObj = createNewStep();
	if (sid < 1) { 
		sid = 0 ;
	} else {
		sid = sid - 1;                // One below the current one. 
	}
	if (!jsonCaseSteps['step']) {
		jsonCaseSteps['step'] = [];
		}
	if (!jQuery.isArray(jsonCaseSteps['step'])) {
		jsonCaseSteps['step'] = [jsonCaseSteps['step']];
		}

	jsonCaseSteps['step'].splice(sid,0,newObj);  // Don't delete anything
	mapCaseJsonToUi(jsonCaseSteps);		
}


function redrawArguments(sid, oneCaseStep,popup) {
	var arguments = oneCaseStep['Arguments']['argument'];

	makePopupArguments(popup, oneCaseStep);

}

function saveOneArgument( sid, aid, xdata) {
	var obj = jsonCaseSteps['step'][sid]['Arguments']['argument'][aid]; 	
	obj['@name'] = katana.$activeTab.find('[argid=caseArgName-'+aid+']').attr('value');
	//obj['@value'] = katana.$activeTab.find('#caseArgValue-'+aid).attr('value');
	obj['@value'] = katana.$activeTab.find('[argid=caseArgValue-'+aid+']').attr('value');
	console.log("Saving..arguments-div "+ sid + " aid = "+ aid);
	console.log(katana.$activeTab.find('[argid=caseArgValue-'+aid+']'));
	console.log(katana.$activeTab.find('[argid=caseArgValue-'+aid+']'));
	console.log(obj);
	//mapTestStepToUI(sid, xdata);
}

function addOneArgument( sid , xdata, popup ) {
	var xx = { "@name": "New" , "@value": "New" };
	console.log("sid =" + sid);
	console.log(xdata);
	console.log(popup);
	jsonCaseSteps['step'][sid]['Arguments']['argument'].push(xx);
	oneCaseStep = jsonCaseSteps['step'][sid];
	redrawArguments(sid, oneCaseStep,popup);
}


function insertOneArgument( sid , aid,  popup ) {
	var xx = { "@name": "" , "@value": " " };
	console.log("sid =" + sid);
	console.log("aid =" + aid);
	console.log(popup);
	jsonCaseSteps['step'][sid]['Arguments']['argument'].splice(aid,0,xx);
	oneCaseStep = jsonCaseSteps['step'][sid];
	redrawArguments(sid, oneCaseStep,popup);
}


function removeOneArgument( sid, aid, popup ) {
	jsonCaseSteps['step'][sid]['Arguments']['argument'].splice(aid,1);	
	console.log("sid =" + sid);
	console.log("aid =" + aid);
	console.log(popup);
	oneCaseStep = jsonCaseSteps['step'][sid];
	redrawArguments(sid, oneCaseStep,popup);
}

// When the edit button is clicked, map step to the UI. 
function mapUItoTestStep(sid,xdata,popup) {
	//var sid = parseInt(katana.$activeTab.find("#StepRowToEdit").attr('value'));	
	console.log(jsonCaseSteps);
		
	// Validate whether sid 
	var xdata = jsonCaseSteps['step'];

	console.log(xdata);
	console.log(sid);
	oneCaseStep = xdata[sid];
	//fillStepDefaults(oneCaseStep);  // Takes care of missing values.... 
	oneCaseStep["@Driver"] = popup.find("#StepDriver").val();
	oneCaseStep["@Keyword"] = popup.find("#StepKeyword").val();
	oneCaseStep["@TS"] =popup.find("#StepTS").val();
	oneCaseStep["Description"] = popup.find("#StepDescription").val();
	oneCaseStep["context"] =  popup.find("#StepContext").val();
	oneCaseStep["Execute"]["@ExecType"]= popup.find("#Execute-at-ExecType").val();		
	oneCaseStep['onError'][ "@action"] = popup.find("#SteponError-at-action").val();
	oneCaseStep['onError'][ "@value"] = popup.find("#SteponError-at-value").val();
	oneCaseStep["runmode"] = { "@type" : popup.find("#runmode-at-type").val()};
	oneCaseStep["impact"] =  popup.find("#StepImpact").val();
	// Now all the arguments have 
	console.log("after saving ",oneCaseStep);
}




function createNewStep(){
	var newCaseStep = {
		"step": {  "@Driver": "demo_driver", "@Keyword": "" , "@TS": "0" },
		"Arguments" : { 'Argument': ""  },
		"onError": {  "@action" : "next", "@value" : "" } ,
		"iteration_type": {   "@type" : "" } ,
		"Description":"",
		"Execute": {   "@ExecType": "Yes",
			"Rule": {   "@Condition": "","@Condvalue": "","@Else": "next", "@Elsevalue": "" }
		}, 
		"context": "positive", 
		"impact" :  "impact",
		"rmt" :  "standard" ,
		"retry": { "@type": "if not", "@Condition": "testsuite_1_result", "@Condvalue": "PASS", "@count": "6", "@interval": "0"}, 
	 };
	 return newCaseStep;
}





function addStepToCase(){
	// Add an entry to the jsonTestSuites....
	var newCaseStep = createNewStep();
	if (!jsonCaseSteps['step']) {
		jsonCaseSteps['step'] = [];
		}
	if (!jQuery.isArray(jsonCaseSteps['step'])) {
		jsonCaseSteps['step'] = [jsonCaseSteps['step']];
		}
	jsonCaseSteps['step'].push(newCaseStep);
	mapCaseJsonToUi(jsonCaseSteps);
}

// Save UI Requirements to JSON table. 
function saveUItoRequirements( ){
	rdata= jsonCaseRequirements['Requirement'];
	rlen = Object.keys(rdata).length;
	console.log("Number of Requirements = " + rlen );
	console.log(rdata);
	for (var s=0; s<Object.keys(rdata).length; s++ ) {
				console.log("Requirements before save "+rdata[s]);
				rdata[s] = katana.$activeTab.find("#textRequirement-"+s+"-id").attr('value');
				console.log("Requirements after save "+rdata[s]);
		}

}

function createRequirementsTable(i_data){
	var items =[]; 
	katana.$activeTab.find("#tableOfCaseRequirements").html("");  // This is a blank div. 
	items.push('<table id="Requirements_table_display" class="configuration_table" >');
	items.push('<thead>');
	items.push('<tr><th>Num</th><th>Requirement</th><th/></tr>');
	items.push('</thead>');
	items.push('<tbody>');
	console.log("createRequirementsTable");
	console.log(i_data);
	if (i_data['Requirement']) {
			rdata= i_data['Requirement'];
			
			for (var s=0; s<Object.keys(rdata).length; s++ ) {
				var oneReq = rdata[s];
				var oneID = parseInt(s) + 1; 
				//console.log(oneReq);
				items.push('<tr><td>'+oneID+'</td>');
				var bid = "textRequirement-"+s+"-id";	
				items.push('<td><input type="text" value="'+oneReq +'" id="'+bid+'"/></td>');
				
				bid = "deleteRequirement-"+s+"-id"+getRandomCaseID();
				items.push('<td><i  title="Delete" class="delete-item-32" value="X" id="'+bid+'"/>');
				
				katana.$activeTab.find('#'+bid).off('click');  // unbind is deprecated - debounces the click event. 
				$(document).on('click','#'+bid,function( ) {
					var names = this.id.split('-');
					var sid = parseInt(names[1]);
					rdata.slice(sid,1); 
					createRequirementsTable(i_data);
				});
				bid = "editRequirement-"+s+"-id"+getRandomCaseID();;
				//items.push('<td><input type="button" class="btn" value="Save" id="'+bid+'"/></td>');
				items.push('<i  title="Edit" class="edit-item-32" value="Edit" id="'+bid+'"/></td>');	
				katana.$activeTab.find('#'+bid).off('click');  // unbind is deprecated - debounces the click event. 
				$(document).on('click','#'+bid,function() {
					var names = this.id.split('-');
					var sid = parseInt(names[1]);
					//console.log("xdata --> "+ rdata);  // Get this value and update your json. 
					var txtIn = katana.$activeTab.find("#textRequirement-"+sid+"-id").attr('value');
					console.log(katana.$activeTab.find("#textRequirement-"+sid+"-id").attr('value'));
					//console.log(sid);
					//console.log(rdata[sid])
					rdata[sid] = txtIn;
					createRequirementsTable(i_data);	
					event.stopPropagation();
					//This is where you load in the edit form and display this row in detail. 
				});
			}
			items.push('</tbody>');
			items.push('</table>');
		}
	bid = "addRequirement-"+getRandomCaseID();
	items.push('<div><input type="button" class="btn btn-success" value="Add Requirement" id="'+bid+'"/></div>');
	katana.$activeTab.find('#'+bid).off('click');  // unbind is deprecated - debounces the click event. 
	$(document).on('click','#'+bid,function( event  ) {
			var names = this.id.split('-');
			var sid = parseInt(names[1]);
			//console.log("Add Requirement... ");
			//console.log(jsonCaseObject['Requirements']);
			if (!jsonCaseObject['Requirements']) jsonCaseObject['Requirements']= { 'Requirement' : [] }
			if (!jQuery.isArray(jsonCaseObject['Requirements']['Requirement'])) {
				jsonCaseObject['Requirements']['Requirement'] = []
			}
			rdata = jsonCaseObject['Requirements']['Requirement'];
			
			rdata.push( "" );
			console.log(jsonCaseObject);
			createRequirementsTable(jsonCaseObject['Requirements']);	
			event.stopPropagation();
		});
	
	katana.$activeTab.find("#tableOfCaseRequirements").html( items.join(""));
	//katana.$activeTab.find('#Requirements_table_display tbody').sortable();
	//katana.$activeTab.find('#Case_table_display').on('click',"td",   function() { 
	//});

}
