$(function(){

	$("form.appnitro").data('active_element','');
	var field_highlight_color = $("form.appnitro").data('highlightcolor');
	
	//attach event handler to all form fields, to highlight the selected list (except for matrix field) 
	$("form.appnitro :input").on('click focus',function(){
		var current_li = $(this).closest("li").not('.matrix').not('.buttons').not('.signature');
		$("form.appnitro").data('active_element',current_li.attr('id'));	
		
		if(current_li.hasClass('highlighted') != true){
			$("form.appnitro li.highlighted").removeClass('highlighted'); //remove any previous highlight
			
//			if(field_highlight_color != '' && field_highlight_color != 'transparent'){
//				if(current_li.attr('id') == $("form.appnitro").data('active_element')){
//					current_li.addClass('highlighted').css('background-color','');
//					current_li.siblings().not('#li_resume_email').css('background-color',''); //remove the remaining color style
//				}else{
//					current_li.css('background-color','');
//				}
			
			if(field_highlight_color != '' && field_highlight_color != 'transparent'){
				//if the user goes through fields too fast, we need to make sure to remove the previous highlight coming from previous animation
				current_li.siblings().not('#li_resume_email').stop(); //stop the highlight animation
				current_li.siblings().not('#li_resume_email').css('background-color',''); //remove the remaining color style
				
				current_li.animate({ backgroundColor: field_highlight_color }, 500, 'swing',function(){
					if(current_li.attr('id') == $("form.appnitro").data('active_element')){
						current_li.addClass('highlighted').css('background-color','');
						current_li.siblings().not('#li_resume_email').css('background-color',''); //remove the remaining color style
					}else{
						current_li.css('background-color','');
					}
				});			
			}else{
				//if background pattern/image being used, simply add the highlight class
				current_li.addClass('highlighted').css('background-color','');
			}
		}
		
	});

	//attach event handler to phone fields, to autotab to the next field
//	$("form.appnitro li.phone input.text").on('keyup', function() {
//		if($(this).val().length == 3){
//			var current_li_id = $(this).parent().parent().parent().attr("id");
//			
//			if($(this).parent().hasClass('phone_1')){
//				$("#" + current_li_id + " .phone_2 > input").focus().select();
//			}else if ($(this).parent().hasClass('phone_2')){
//				$("#" + current_li_id + " .phone_3 > input").focus().select();
//			}
//		}
//	});

	//attach event handler to signature fields, to draw the signature images when the user type the full name
	$("form.appnitro li.signature input.text_signature").on('keyup', function() {
		var element_id 	   = $(this).data("elementid");
		var signature_text = $(this).val(); 

		$("#element_" + element_id).val(signature_text);
		$("#element_" + element_id + "_text_signature_img").attr("src","signature_img_renderer.php?signature_text=" + signature_text);
	});



	//attach event handler to date fields, to show calendar on focus
	$("form.appnitro li.date_field span.date_mm input.text,form.appnitro li.europe_date_field span.date_dd input.text").on('click focus', function() {
		var current_datepick = '#' + $(this).attr("id").slice(0,-1) + 'datepick';
		$(current_datepick).datepick('show');
	});
	
	$("form.appnitro li.date_field span.date_yyyy input.text,form.appnitro li.europe_date_field span.date_yyyy input.text").on('focusout', function() {
		var current_datepick = '#' + $(this).attr("id").slice(0,-1) + 'datepick';
		$(current_datepick).datepick('hide');
	});
	
	//if the form has file upload field, attach custom submit handler to the form
	//make sure all files are being uploaded prior submitting the form
	if($("#main_body div.file_queue").length > 0){
		$('form.appnitro').submit(function() {
			
			if($("form.appnitro").data('form_submitting') !== true){
				
				$("#li_buttons > input[type=submit],#li_buttons > input[type=image]").prop("disabled",true);
				
				$("form.appnitro").data('form_submitting',true);
				upload_all_files();
				return false;
			}else{
				return true;	
			}
		});
		
	}else{
		$('form.appnitro').submit(function() {
			$("#li_buttons > input[type=submit],#li_buttons > input[type=image]").prop("disabled",true);		
		});
	}
	
	//primary and secondary buttons are being disabled upon submit
	//thus we need to attach additional handler to send the clicked button as hidden variable
	$("#submit_secondary,#submit_img_secondary").click(function(){
		$("#li_buttons").append('<input type="hidden" name="submit_secondary" value="1" />');
	});

	$("#submit_primary,#submit_img_primary").click(function(){
		$("#li_buttons").append('<input type="hidden" name="submit_primary" value="1" />');
	});

	$("#review_submit").click(function(){
		$("#li_buttons").append('<input type="hidden" name="review_submit" value="1" />');
	});

	$("#review_back").click(function(){
		$("#li_buttons").append('<input type="hidden" name="review_back" value="1" />');
	});
	
	//if the form has resume enabled, attach event handler to the resume checkbox
	if($("#li_resume_checkbox").length > 0){
		$('#element_resume_checkbox').on('change', function() {
			
				if($(this).prop("checked") == true){
					//display the email input and change the submit button
					$("#li_resume_email").show();
					
					//hide all existing buttons
					$("#li_buttons > input").hide();
					
					//add the save form button
					$("#li_buttons").append('<input type="button" value="' + $("#li_resume_email").data("resumelabel") + '" name="button_save_form" class="button_text" id="button_save_form">');
					$("#button_save_form").click(function(){
						$("#li_buttons").append('<input type="hidden" id="generate_resume_url" name="generate_resume_url" value="1" />');
						$("form.appnitro").submit();
					});
					
				}else{
					//hide the email input and restore the original submit button
					$("#li_resume_email").hide();
					
					$("#button_save_form").remove();
					$("#li_buttons > input").show();
				}

				if($("html").hasClass("embed")){
					$.postMessage({mf_iframe_height: $('body').outerHeight(true)}, '*', parent );
				}
		});
		
		//if the user entered invalid address, the 'data-resumebutton' will contain value 1
		//we need to display the save form button again and hide others
		if($("#li_resume_email").data("resumebutton") == '1'){
			//hide all existing buttons
			$("#li_buttons > input").hide();
			
			//add the save form button
			$("#li_buttons").append('<input type="button" value="' + $("#li_resume_email").data("resumelabel") + '" name="button_save_form" class="button_text" id="button_save_form">');
			$("#button_save_form").click(function(){
				$("#li_buttons").append('<input type="hidden" id="generate_resume_url" name="generate_resume_url" value="1" />');
				$("form.appnitro").submit();
			});
		}
		
		//attach additional event handler to the form submit
		$('form.appnitro').submit(function(){
			if($("#li_buttons > input:visible").attr("id") == 'button_save_form'){
				$("#li_buttons").append('<input type="hidden" id="generate_resume_url" name="generate_resume_url" value="1" />');
			}
		});
	}
	
	//if the form has payment enabled and the total is being displayed into the form, we need to calculate the total
	//and attach event handler to price-assigned fields
	if($(".total_payment").length > 0 && $(".mf_review").length == 0){
		
		calculate_total_payment();
		
		//attach event handler on radio buttons with price assigned
		$('#main_body li[data-pricefield="radio"]').delegate('input.radio', 'click', function(e) {
			var selected_radio = $(this);
			var temp = selected_radio.attr("id").split('_');
			var element_id = temp[1];
			
			var pricedef = selected_radio.data('pricedef');
			if(pricedef == null){
				pricedef = 0;
			}

			var quantity_field   = $("#main_body input[data-quantity_link=element_"+ element_id +"]");
			var current_quantity = 1;

			if(quantity_field.length > 0){
				current_quantity = parseFloat(quantity_field.val());			
				if(isNaN(current_quantity) || current_quantity < 0){
					current_quantity = 0;
				}
			}
			

			$("#li_" + element_id).data("pricevalue",pricedef * current_quantity);
			calculate_total_payment();
		});

		//attach event handler on 'other' field of the radio buttons
		$('#main_body li[data-pricefield="radio"]').delegate('input.other', 'keyup change', function(e) {
			
			var temp = $(this).attr("id").split('_');
			var element_id = temp[1];

			var entered_value = parseFloat($(this).val());
			if(isNaN(entered_value)){
				entered_value = 0;
			}

			$("#element_" + element_id + "_0").data("pricedef",entered_value);
			$("#li_" + element_id).data("pricevalue",entered_value);

			calculate_total_payment();
		});

		//attach event handler on checkboxes with price assigned
		$('#main_body li[data-pricefield="checkbox"]').delegate('input.checkbox', 'click', function(e) {
			
			var temp = $(this).attr("id").split('_');
			var element_id = temp[1];
			
			var child_checkboxes = $("#li_" + element_id + " input.checkbox");
			var total_price = 0;

			child_checkboxes.each(function(index){
				if($(this).data('pricedef') != null && $(this).prop("checked") == true){
					var quantity_field   = $("#main_body input[data-quantity_link="+ $(this).attr("id") +"]");
					var current_quantity = 1;

					if(quantity_field.length > 0){
						current_quantity = parseFloat(quantity_field.val());			
						if(isNaN(current_quantity) || current_quantity < 0){
							current_quantity = 0;
						}
					}

					total_price += ($(this).data('pricedef') * current_quantity);
				}
			});
			
			$("#li_" + element_id).data("pricevalue",total_price);
			calculate_total_payment();
		});

		//attach event handler on 'other' field of the checkboxes
		$('#main_body li[data-pricefield="checkbox"]').delegate('input.other', 'keyup change', function(e) {
			
			var temp = $(this).attr("id").split('_');
			var element_id = temp[1];

			var entered_value = parseFloat($(this).val());
			if(isNaN(entered_value)){
				entered_value = 0;
			}

			$("#element_" + element_id + "_0").data("pricedef",entered_value);
			
			var child_checkboxes = $("#li_" + element_id + " input.checkbox");
			var total_price = 0;

			child_checkboxes.each(function(index){
				if($(this).data('pricedef') != null && $(this).prop("checked") == true){
					var quantity_field   = $("#main_body input[data-quantity_link="+ $(this).attr("id") +"]");
					var current_quantity = 1;

					if(quantity_field.length > 0){
						current_quantity = parseFloat(quantity_field.val());			
						if(isNaN(current_quantity) || current_quantity < 0){
							current_quantity = 0;
						}
					}

					total_price += ($(this).data('pricedef') * current_quantity);
				}
			});
			
			$("#li_" + element_id).data("pricevalue",total_price);
			calculate_total_payment();
			
		});
		
		//attach event handler on dropdown with price assigned
		$('#main_body li[data-pricefield="select"]').delegate('select', 'change', function(e) {
			var temp = $(this).attr("id").split('_');
			var element_id = temp[1];
			
			var pricedef = $(this).find('option:selected').data('pricedef');
			
			if(pricedef == null){
				pricedef = 0;
			}

			var quantity_field   = $("#main_body input[data-quantity_link=element_"+ element_id +"]");
			var current_quantity = 1;

			if(quantity_field.length > 0){
				current_quantity = parseFloat(quantity_field.val());			
				if(isNaN(current_quantity) || current_quantity < 0){
					current_quantity = 0;
				}
			}
			
			$("#li_" + element_id).data("pricevalue",pricedef * current_quantity);
			calculate_total_payment();
		});
		
		//attach event handler to money field (dollar, euro, etc)
		$('#main_body li[data-pricefield="money"]').delegate('input.text','keyup mouseout change', function(e) {
			var temp = $(this).attr("id").split('_');
			var element_id = temp[1];
			
			var price_value = $("#element_" + element_id + "_1").val() + '.' + $("#element_" + element_id + "_2").val();
			price_value = parseFloat(price_value);
			if(isNaN(price_value)){
				price_value = 0;
			}

			var quantity_field   = $("#main_body input[data-quantity_link=element_"+ element_id +"]");
			var current_quantity = 1;

			if(quantity_field.length > 0){
				current_quantity = parseFloat(quantity_field.val());			
				if(isNaN(current_quantity) || current_quantity < 0){
					current_quantity = 0;
				}
			}
			
			$("#li_" + element_id).data("pricevalue",price_value * current_quantity);
			calculate_total_payment();
		});
		
		//attach event handler to simple money field (yen)
		$('#main_body li[data-pricefield="money_simple"]').delegate('input.text','keyup mouseout change', function(e) {
			var temp = $(this).attr("id").split('_');
			var element_id = temp[1];
			
			var price_value = $(this).val();
			price_value = parseFloat(price_value);
			if(isNaN(price_value)){
				price_value = 0;
			}

			var quantity_field   = $("#main_body input[data-quantity_link=element_"+ element_id +"]");
			var current_quantity = 1;

			if(quantity_field.length > 0){
				current_quantity = parseFloat(quantity_field.val());			
				if(isNaN(current_quantity) || current_quantity < 0){
					current_quantity = 0;
				}
			}
			
			$("#li_" + element_id).data("pricevalue",price_value * current_quantity);
			calculate_total_payment();
		});

		//attach event handler to the number field that has 'quantity' enabled
		$("#main_body input[data-quantity_link]").on('keyup mouseout change', function() {
			var linked_field_id = $(this).data("quantity_link");
			var temp = linked_field_id.split('_');

			var current_quantity = parseFloat($(this).val());
			if(isNaN(current_quantity) || current_quantity < 0){
				current_quantity = 0;
			}

			//find linked field and trigger the event handle for that field, based on the field type
			var linked_field_type = $('#li_' + temp[1]).data("pricefield");

			if(linked_field_type == 'radio'){
				var selected_radio = $("input[name="+ linked_field_id +"]:checked");
				
				if(selected_radio.length > 0){
					var temp = selected_radio.attr("id").split('_');
					var element_id = temp[1];
					
					var pricedef = selected_radio.data('pricedef');
					if(pricedef == null){
						pricedef = 0;
					}				
				
					$("#li_" + element_id).data("pricevalue",pricedef * current_quantity);
					calculate_total_payment();
				}

			}else if(linked_field_type == 'select'){
				
				var element_id = temp[1];
				var pricedef = $('#' + linked_field_id).find('option:selected').data('pricedef');
				
				if(pricedef == null){
					pricedef = 0;
				}

				$("#li_" + element_id).data("pricevalue",pricedef * current_quantity);
				calculate_total_payment();
			}else if(linked_field_type == 'checkbox'){				
				var element_id = temp[1];
				
				var child_checkboxes = $("#li_" + element_id + " input.checkbox");
				var total_price = 0;

				child_checkboxes.each(function(index){
					if($(this).data('pricedef') != null && $(this).prop("checked") == true){
						var quantity_field   = $("#main_body input[data-quantity_link="+ $(this).attr("id") +"]");
						var current_quantity = 1;

						if(quantity_field.length > 0){
							current_quantity = parseFloat(quantity_field.val());			
							if(isNaN(current_quantity) || current_quantity < 0){
								current_quantity = 0;
							}
						}

						total_price += ($(this).data('pricedef') * current_quantity);
					}
				});
				
				$("#li_" + element_id).data("pricevalue",total_price);
				calculate_total_payment();
			}else if(linked_field_type == 'money'){
				var element_id = temp[1];
				var price_value = $("#element_" + element_id + "_1").val() + '.' + $("#element_" + element_id + "_2").val();
				
				price_value = parseFloat(price_value);
				if(isNaN(price_value)){
					price_value = 0;
				}

				$("#li_" + element_id).data("pricevalue",price_value * current_quantity);
				calculate_total_payment();
			}else if(linked_field_type == 'money_simple'){
				var element_id = temp[1];
				var price_value = $("#element_" + element_id).val();
				
				price_value = parseFloat(price_value);
				if(isNaN(price_value)){
					price_value = 0;
				}

				$("#li_" + element_id).data("pricevalue",price_value * current_quantity);
				calculate_total_payment();
			}

		});
		
		//trigger the event handler on all number fields that has 'quantity' enabled, to initialize the calculation
		$("#main_body input[data-quantity_link]").change();
		
	}

	
	//attach event handler to textarea field to handle resizing
	if($("html").hasClass("embed")){
		$("#main_body textarea.textarea").on('keyup mouseout mousemove change', function() {
			$.postMessage({mf_iframe_height: $('body').outerHeight(true)}, '*', parent );
		});		    	
	}
	
	//if the password box is being displayed, add the class 'no_guidelines into the main_body
	if($("form.appnitro ul.password").length > 0){
		$("#main_body").addClass('no_guidelines');
	}

	//workaround for mobile safari, to allow tapping on label
	$('form.appnitro label').click(function(){});

	//workaround for any Safari browsers, when the form being embedded
	//we need to set the cookies here
	if($("html").hasClass("embed") && navigator.userAgent.indexOf('Safari') != -1 && document.cookie.indexOf("mf_safari_cookie_fix") < 0){
		$.postMessage({run_safari_cookie_fix: '1'}, '*', parent );
	}

	//remove track settings from videojs, it's not being used and not accessible
	$(".vjs-text-track-settings").remove();

});

/** Payment Functions **/
function calculate_total_payment(){
	var total_payment = 0;
	
	//get totals from all visible fields (hidden fields due to logic shouldn't be included)
	$("#main_body li[data-pricevalue]:visible").each(function(index){
		total_payment += parseFloat($(this).data('pricevalue'));
	});
	
	//get totals from all fields intentionally hidden using custom css class "hidden"
	$("#main_body li[data-pricevalue].hidden").each(function(index){
		total_payment += parseFloat($(this).data('pricevalue'));
	});

	total_payment += parseFloat($('.total_payment').data('basetotal'));
	
	$(".total_payment var").text(total_payment.toFixed(2));
}

/** Date Picker Functions **/
function select_date(dates){
	var ids = $(this).attr("id").split('_');
	
    $('#element_' + ids[1] + '_1').val(dates.length ? dates[0].getMonth() + 1 : ''); 
    $('#element_' + ids[1] + '_2').val(dates.length ? dates[0].getDate() : ''); 
    $('#element_' + ids[1] + '_3').val(dates.length ? dates[0].getFullYear() : '');
    $('#element_' + ids[1] + '_1').change(); 
}

function select_europe_date(dates){
	var ids = $(this).attr("id").split('_');
	
    $('#element_' + ids[1] + '_2').val(dates.length ? dates[0].getMonth() + 1 : ''); 
    $('#element_' + ids[1] + '_1').val(dates.length ? dates[0].getDate() : ''); 
    $('#element_' + ids[1] + '_3').val(dates.length ? dates[0].getFullYear() : '');
    $('#element_' + ids[1] + '_1').change();  
}
/** File Upload Functions **/
function remove_attachment(filename,form_id,element_id,holder_id,is_db_live,key_id){
	
	var machform_path = '';
	if (typeof __machform_path != 'undefined'){
		machform_path = __machform_path;
	}

	$("#" + holder_id + " > div.cancel img").attr("src", machform_path + "images/loader_small_grey.gif");
	$.ajax({
		   type: "POST",
		   async: true,
		   url: machform_path + "delete_file_upload.php",
		   data: {
				  filename: filename,
				  form_id: form_id,
				  element_id: element_id,
				  holder_id: holder_id,
				  is_db_live: is_db_live,
				  key_id: key_id
				 },
		   cache: false,
		   global: true,
		   dataType: "json",
		   error: function(xhr,text_status,e){
			   //remove the delete progress on error
			   $("#" + holder_id + " > div.cancel img").attr("src",machform_path + "images/icons/delete.png");
			   alert('Error! Unable to delete file.');
		   },
		   success: function(response_data){
			  
			   if(response_data.status == 'ok'){
				   if(is_support_html5_uploader()){
				   	   try{
				   	   		$("#element_" + response_data.element_id).uploadifive('cancel',$("#" + response_data.holder_id).data('file'));
				   	   }catch(e){}
				   	   $("#" + response_data.holder_id).fadeOut("slow",function(){$(this).remove();});
				   }else{
				       $("#" + response_data.holder_id).fadeOut("slow",function(){$(this).remove();});
				   }
			   }else{
				   //unknown error, response json improperly formatted
				  $("#" + holder_id + " > div.cancel img").attr("src",machform_path + "images/icons/delete.png");
				  alert('Error while deleting the file. Please try again.');
			   }
			   
		   } //end on ajax success
	}); //end ajax call
	
}
function check_upload_queue(element_id,is_multi,queue_limit,alert_message){
	//check for queue limit
	if(is_multi == true){
		var queue_children = $("#element_" + element_id + "_queue").children().not('.uploadifyError');
		if(queue_children.length > queue_limit){
			alert(alert_message);
			
			for(i=0;i<=queue_children.length;i++){
				if(i>=queue_limit){
					$("#element_" + element_id).uploadifyCancel(queue_children.eq(i).attr('id').slice(-6));
				}
			}
		}
	}	
}

function upload_all_files(){
	if(is_support_html5_uploader()){
		$("#main_body input.file").uploadifive('upload');
		if($("#main_body div.uploadifive-queue-item").not('.complete').not('.error').length < 1){
			$('form.appnitro').submit();
		}
	}
}

//Check if HTML5 uploader is supported by the browser
function is_support_html5_uploader(){
	if (window.File && window.FileList && window.Blob && (window.FileReader || window.FormData)) {
		return true;
	}else{
		return false;
	}
}

/** Input Range Functions **/
function count_input(element_id,range_limit_by){
	var current_length = 0;
	
	if(range_limit_by == 'c' || range_limit_by == 'd'){
		current_length = $("#element_" + element_id).val().length;
	}else if(range_limit_by == 'w'){
		current_length = $("#element_" + element_id).val().trim().split(/[\s\.]+/).length; //we consider a word is one or more characters separated by space or dot
	}
	
	$("#currently_entered_" + element_id).text(current_length);
	
	return current_length;
}

function limit_input(element_id,range_limit_by,range_max){
	var current_length = count_input(element_id,range_limit_by);
	
	if(current_length > range_max){
		if(range_limit_by == 'c' || range_limit_by == 'd'){
			$("#element_" + element_id).val($("#element_" + element_id).val().substr(0,range_max));
			$("#currently_entered_" + element_id).text(range_max);
		}else if(range_limit_by == 'w'){
			//for now, we don't limit the words on client side, only server side validation
		}
	}
}

//clear checkbox 'other'
function clear_cb_other(cb_element,element_id){
	if($(cb_element).prop("checked") == false){
		$("#element_" + element_id + "_other").val('');
	}	
}

//Firefox Focus Issue Fix Where onclick would not show cursor in form input field

function iuFocusInput(elementId) {
 setTimeout( function() {
   document.getElementById(elementId).focus();
 },100);
} 

//resize signature field's canvas
//adjust canvas coordinate space taking into account pixel ratio, to make it look crisp on mobile devices
function refresh_signature(signature_pad,signature_canvas){
	var ratio =  Math.max(window.devicePixelRatio || 1, 1);

	// This part causes the canvas to be cleared
	signature_canvas.width = signature_canvas.offsetWidth * ratio;
	signature_canvas.height = signature_canvas.offsetHeight * ratio;
	signature_canvas.getContext("2d").scale(ratio, ratio);

	signature_pad.clear();
}

//clear the signature canvas
function clear_signature(element_id){
	var canvas = document.getElementById('mf_canvas_signature_pad_' + element_id);
	var signature_pad = new SignaturePad(canvas);

	signature_pad.clear();
	$("#element_" + element_id).val('');
}

//show/hide the draw/type signature content
function switch_signature_type(element_id,signature_type){
	$("#li_" + element_id + " .mf_signature_draw").hide();
	$("#li_" + element_id + " .mf_signature_type").hide();
	$("#li_" + element_id + " .mf_signature_switch a").removeClass('active');

	//show/hide the signature content pad
	if(signature_type == 'draw'){
		$("#li_" + element_id + " .mf_signature_draw").show();
		
		//when switching to signature pad draw, reset the previously entered signature
		var signature_canvas = document.getElementById('mf_canvas_signature_pad_' + element_id);
		var signature_pad    = new SignaturePad(signature_canvas);

		refresh_signature(signature_pad,signature_canvas);
		$("#element_" + element_id).val('');

		$("#li_" + element_id + " .mf_signature_switch a.sig_switch_draw").addClass('active');
	}else{
		$("#li_" + element_id + " .mf_signature_type").show();
		$("#li_" + element_id + " .mf_signature_switch a.sig_switch_type").addClass('active');
		$("#element_" + element_id).val($("#element_" + element_id + "_text_signature").val());
	}
}