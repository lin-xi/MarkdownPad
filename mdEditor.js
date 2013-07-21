(function($){

	var htmlholder = $(".html-holder"),
		menuBar = $('.menuBar', htmlholder),
		htmlEditor = $('#htmlEditor'),
		mdViewer = $('#mdViewer'),

		undo = menuBar.find('.undo'),
		redo = menuBar.find('.redo'),
		
		format = menuBar.find('.format'),
		bold = menuBar.find('.bold'),
		italic = menuBar.find('.italic'),
		strikethrough = menuBar.find('.strikethrough'),
		quote = menuBar.find('.quote'),
		list = menuBar.find('.list'),
		numlist = menuBar.find('.numlist'),
		hr = menuBar.find('.hr'),
		link = menuBar.find('.link'),
		unlink = menuBar.find('.unlink'),
		image = menuBar.find('.image'),
		code = menuBar.find('.code'),
		clear = menuBar.find('.clear'),

		render = menuBar.find('.render');

	htmlEditor.on('keydown', function(e){
		if(e.keycode == 13){
			doExec("formatBlock","<p>");
		}
	});
	htmlEditor.on('keyup', parseHtml);
	htmlEditor.on('change', parseHtml);
	htmlEditor.on('blur', parseHtml);
	
	undo.click( function() {
		doExec("undo", "");
	});
	redo.click( function() {
		doExec("redo", "");
	});
	format.on('click', function(e){
		var tar = $(e.target);
		e.preventDefault();
		e.stopPropagation();
		dropdownMenu(tar, {
			'h1': 'H1',
			'h2': 'H2',
			'h3': 'H3',
			'h4': 'H4',
			'h5': 'H5',
			'h6': 'H6'
		}, function(val){
			console.log('<'+val+'>');
			doExec("formatBlock", '<'+val+'>');

		});
	});
	bold.on('click', function(){
		console.log('bold');
		doExec("bold", "");
	});
	italic.on('click', function(){
		doExec("italic", "");
	});
	quote.on('click', function(){
		doExec("formatBlock", "<blockquote>");
	});
	list.on('click', function(){
		doExec("insertunorderedlist", "");
	});
	numlist.on('click', function(){
		doExec("insertorderedlist", "");
	});
	hr.on('click', function(){
		doExec("inserthorizontalrule", "");
	});
	link.on('click', function(){
		var xtra = prompt("Enter a URL:", "http://");
		doExec("createlink", xtra);
	});
	unlink.on('click', function(){
		doExec("unlink", '');
	});
	image.on('click', function(e){
		var tar = $(e.target);
		showFileDialog(tar, function(url){
			doExec("insertimage", url);
		});
	});
	code.on('click', function(){
		doExec("formatBlock", "<pre>");
	});
	clear.on('click', function(){
		doExec("formatBlock", "<code>");
	});
	render.on('click', parseHtml);

	function doExec(fx, extra){
		document.execCommand(fx, false, extra);
		htmlEditor.focus();
		parseHtml();
	}

	function parseHtml(){
		var html = htmlEditor.html();
		console.time('parse');
		mdViewer.val(MarkDown.parse(html));
		console.timeEnd('parse');
	}

	function dropdownMenu(target, data, fn){
		var menu = $('<div class="dd-menu"></div>');
		menu.appendTo($('body'));
		var off = target.offset();
		menu.offset({left: off.left+10, top: off.top+target.outerHeight()});
		for(var key in data){
			var d = data[key];
			$('<button val="'+key+'" class="menu-item">'+ d +'</button>').appendTo(menu);
		}
		menu.delegate('.menu-item', 'click', function(e){
		  	var tar = $(e.target);
		  	fn(tar.attr('val'));
		  	menu.remove();
		});
		$('body').on('click', hideMenu);
		function hideMenu(){
			menu.remove();
			$('body').off('click', hideMenu);
		}
	}

	function showFileDialog(target, fn){
		var menu = $('<div class="photo-menu"><div class="remote"><input id="remoteRadio" value="1" class="urltpye" type="radio" name="urltpye">网址：<input id="imgUrl" type="text"/></div><div class="local"><input id="localRadio" value="2" type="radio" class="urltpye" name="urltpye" checked><input type="file" id="imgFiles" name="files" /><div id="imglist"></div></div><div><button id="imgOk">确定</button></div></div>');
		menu.appendTo($('body'));
		var off = target.offset();
		menu.offset({left: off.left-380, top: off.top+target.outerHeight()});
		
		var url;
		$('#imgFiles').on('change', function(evt){
    		// Reset progress indicator on new file selection.
    		var file = evt.target.files[0]; 
    		if (!file.type.match('image.*')) {
    			alert("请选择图片类型文件");
    			return;
  			}
    		var reader = new FileReader();
    		reader.onload = function(e) {
	          	// Render thumbnail.
	          	var span = $(['<img class="thumb" src="', e.target.result, '" title="', escape(file.name), '"/>'].join(''));
	          	$('#imglist').prepend(span);
	          	url = e.target.result;
	        };

  			reader.readAsDataURL(file);
  		});

		function handleFilesSelect(evt) {
			console.log(evt);
    		var files = evt.target.files; // FileList object
    		// Loop through the FileList and render image files as thumbnails.
    		for (var i = 0, f; f = files[i]; i++) {
      			// Only process image files.
      			if (!f.type.match('image.*')) {
        			continue;
      			}
      			var reader = new FileReader();
      			// Closure to capture the file information.
      			reader.onload = (function(theFile) {
			        return function(e) {
			          	$('#imglist').html(['<img class="thumb" src="', e.target.result, '" title="', escape(theFile.name), '"/>'].join(''));
			          	url = e.target.result;
			        };
      			})(f);
      			// Read in the image file as a data URL.
  				reader.readAsDataURL(f);
			}
		}

		$('#imgOk').on('click', function(e){
			var type = $('input[name="urltpye"]:checked').val();
			type == '1' && (url=$('#imgUrl').val()); 
			console.log(url);
			if(url && url != ''){
				fn(url);
			}
			menu.remove();
		});

		function scalePhoto(w, h, iw, ih){
			var size={}, scale;
			if(iw > w){
				size.width = w;
				scale = w/iw;
				size.height = ih*scale;
			}else{
				size.width = iw;
				size.height = ih;
			}
			if(size.height > h){
				size.height = h;
				scale = h/ih;
				size.width = iw*scale;
			}
			return size;
		}
	}

	
})(jQuery, MarkDown);