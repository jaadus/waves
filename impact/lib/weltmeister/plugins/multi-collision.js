ig.module(
	'weltmeister.plugins.multi-collision'
).requires(
	'weltmeister.weltmeister'
).defines( function() {	'use strict';

	wm.Weltmeister.inject({
		collisionLayer_1: null,
		collisionLayer_2: null,

		init: function() {
			ig.game = ig.editor = this;

			ig.system.context.textBaseline = 'top';
			ig.system.context.font = wm.config.labels.font;
			this.labelsStep = wm.config.labels.step;


			// Dialogs
			this.loadDialog = new wm.ModalDialogPathSelect( 'Load Level', 'Load', 'scripts' );
			this.loadDialog.onOk = this.load.bind(this);
			this.loadDialog.setPath( wm.config.project.levelPath );
			$('#levelLoad').bind( 'click', this.showLoadDialog.bind(this) );
			$('#levelNew').bind( 'click', this.showNewDialog.bind(this) );

			this.saveDialog = new wm.ModalDialogPathSelect( 'Save Level', 'Save', 'scripts' );
			this.saveDialog.onOk = this.save.bind(this);
			this.saveDialog.setPath( wm.config.project.levelPath );
			$('#levelSaveAs').bind( 'click', this.saveDialog.open.bind(this.saveDialog) );
			$('#levelSave').bind( 'click', this.saveQuick.bind(this) );

			this.loseChangesDialog = new wm.ModalDialog( 'Lose all changes?' );

			this.deleteLayerDialog = new wm.ModalDialog( 'Delete Layer? NO UNDO!' );
			this.deleteLayerDialog.onOk = this.removeLayer.bind(this);

			this.mode = this.MODE.DEFAULT;


			this.tilesetSelectDialog = new wm.SelectFileDropdown( '#layerTileset', wm.config.api.browse, 'images' );
			this.entities = new wm.EditEntities( $('#layerEntities') );

			$('#layers').sortable({
				update: this.reorderLayers.bind(this)
			});
			$('#layers').disableSelection();
			this.resetModified();


			// Events/Input
			if( wm.config.touchScroll ) {
				// Setup mousewheel event
				ig.system.canvas.addEventListener('mousewheel', this.touchScroll.bind(this), false );

				// Unset MWHEEL_* binds
				delete wm.config.binds['MWHEEL_UP'];
				delete wm.config.binds['MWHEEL_DOWN'];
			}

			for( var key in wm.config.binds ) {
				ig.input.bind( ig.KEY[key], wm.config.binds[key] );
			}
			ig.input.keydownCallback = this.keydown.bind(this);
			ig.input.keyupCallback = this.keyup.bind(this);
			ig.input.mousemoveCallback = this.mousemove.bind(this);

			$(window).resize( this.resize.bind(this) );
			$(window).bind( 'keydown', this.uikeydown.bind(this) );
			$(window).bind( 'beforeunload', this.confirmClose.bind(this) );

			$('#buttonAddLayer').bind( 'click', this.addLayer.bind(this) );
			$('#buttonRemoveLayer').bind( 'click', this.deleteLayerDialog.open.bind(this.deleteLayerDialog) );
			$('#buttonSaveLayerSettings').bind( 'click', this.saveLayerSettings.bind(this) );
			$('#reloadImages').bind( 'click', ig.Image.reloadCache );
			$('#layerIsCollision_1').bind( 'change', this.toggleCollisionLayer.bind(this) );
			$('#layerIsCollision_2').bind( 'change', this.toggleCollisionLayer.bind(this) );

			$('input#toggleSidebar').click(function() {
				$('div#menu').slideToggle('fast');
				$('input#toggleSidebar').toggleClass('active');
			});

			// Always unfocus current input field when clicking the canvas
			$('#canvas').mousedown(function(){
				$('input:focus').blur();
			});


			this.undo = new wm.Undo( wm.config.undoLevels );


			if( wm.config.loadLastLevel ) {
				var path = $.cookie('wmLastLevel');
				if( path ) {
					this.load( null, path )
				}
			}

			ig.setAnimation( this.drawIfNeeded.bind(this) );
		},

		uikeydown: function( event ) {
			if( event.target.type == 'text' ) {
				return;
			}

			var key = String.fromCharCode(event.which);
			if( key.match(/^\d$/) ) {
				var index = parseInt(key);
				var name = $('#layers div.layer:nth-child('+index+') span.name').text();

				var layer = name == 'entities'
					? this.entities
					: this.getLayerWithName(name);

				if( layer ) {
					if( event.shiftKey ) {
						layer.toggleVisibility();
					} else {
						this.setActiveLayer( layer.name );
					}
				}
			}
		},


		showLoadDialog: function() {
			if( this.modified ) {
				this.loseChangesDialog.onOk = this.loadDialog.open.bind(this.loadDialog);
				this.loseChangesDialog.open();
			} else {
				this.loadDialog.open();
			}
		},

		showNewDialog: function() {
			if( this.modified ) {
				this.loseChangesDialog.onOk = this.loadNew.bind(this);
				this.loseChangesDialog.open();
			} else {
				this.loadNew();
			}
		},

		setModified: function() {
			if( !this.modified ) {
				this.modified = true;
				this.setWindowTitle();
			}
		},

		resetModified: function() {
			this.modified = false;
			this.setWindowTitle();
		},

		setWindowTitle: function() {
			document.title = this.fileName + (this.modified ? ' * ' : ' - ') + 'Weltmeister';
			$('span.headerTitle').text(this.fileName);
			$('span.unsavedTitle').text(this.modified ? '*' : '');
		},


		confirmClose: function( event ) {
			var rv = undefined;
			if( this.modified && wm.config.askBeforeClose ) {
				rv = 'There are some unsaved changes. Leave anyway?';
			}
			event.returnValue = rv;
			return rv;
		},


		resize: function() {
			ig.system.resize(
				Math.floor(wm.Weltmeister.getMaxWidth() / wm.config.view.zoom),
				Math.floor(wm.Weltmeister.getMaxHeight() / wm.config.view.zoom),
				wm.config.view.zoom
			);
			ig.system.context.textBaseline = 'top';
			ig.system.context.font = wm.config.labels.font;
			this.draw();
		},

		scroll: function(x, y) {
			this.screen.x -= x;
			this.screen.y -= y;

			this._rscreen.x = Math.round(this.screen.x * ig.system.scale)/ig.system.scale;
			this._rscreen.y = Math.round(this.screen.y * ig.system.scale)/ig.system.scale;
			for( var i = 0; i < this.layers.length; i++ ) {
				this.layers[i].setScreenPos( this.screen.x, this.screen.y );
			}
		},

		drag: function() {
			var dx = ig.input.mouse.x - this.mouseLast.x,
				dy = ig.input.mouse.y - this.mouseLast.y;
			this.scroll(dx, dy);
		},

		touchScroll: function( event ) {
			event.preventDefault();

			this.scroll( event.wheelDeltaX/ig.system.scale, event.wheelDeltaY/ig.system.scale );
			this.draw();
			return false;
		},

		zoom: function( delta ) {
			var z = wm.config.view.zoom;
			var mx = ig.input.mouse.x * z,
				my = ig.input.mouse.y * z;

			if( z <= 1 ) {
				if( delta < 0 ) {
					z /= 2;
				}
				else {
					z *= 2;
				}
			}
			else {
				z += delta;
			}

			wm.config.view.zoom = z.limit( wm.config.view.zoomMin, wm.config.view.zoomMax );
			wm.config.labels.step = Math.round( this.labelsStep / wm.config.view.zoom );
			$('#zoomIndicator').text( wm.config.view.zoom + 'x' ).stop(true,true).show().delay(300).fadeOut();

			// Adjust mouse pos and screen coordinates
			ig.input.mouse.x = mx / wm.config.view.zoom;
			ig.input.mouse.y = my / wm.config.view.zoom;
			this.drag();

			for( var i in ig.Image.cache ) {
				ig.Image.cache[i].resize( wm.config.view.zoom );
			}

			this.resize();
		},


		// -------------------------------------------------------------------------
		// Loading

		loadNew: function() {
			$.cookie( 'wmLastLevel', null );
			while( this.layers.length ) {
				this.layers[0].destroy();
				this.layers.splice( 0, 1 );
			}
			this.screen = {x: 0, y: 0};
			this.entities.clear();
			this.fileName = 'untitled.js';
			this.filePath = wm.config.project.levelPath + 'untitled.js';
			this.levelData = {};
			this.saveDialog.setPath( this.filePath );
			this.resetModified();
			this.draw();
		},


		load: function( dialog, path ) {
			this.filePath = path;
			this.saveDialog.setPath( path );
			this.fileName = path.replace(/^.*\//,'');

			var req = $.ajax({
				url:( path + '?nocache=' + Math.random() ),
				dataType: 'text',
				async:false,
				success: this.loadResponse.bind(this),
				error: function() { $.cookie( 'wmLastLevel', null ); }
			});
		},


		loadResponse: function( data ) {
			$.cookie( 'wmLastLevel', this.filePath );

			// extract JSON from a module's JS
			var jsonMatch = data.match( /\/\*JSON\[\*\/([\s\S]*?)\/\*\]JSON\*\// );
			data = JSON.parse( jsonMatch ? jsonMatch[1] : data );
			this.levelData = data;

			while( this.layers.length ) {
				this.layers[0].destroy();
				this.layers.splice( 0, 1 );
			}
			this.screen = {x: 0, y: 0};
			this.entities.clear();

			for( var i=0; i < data.entities.length; i++ ) {
				var ent = data.entities[i];
				this.entities.spawnEntity( ent.type, ent.x, ent.y, ent.settings );
			}

			for( var i=0; i < data.layer.length; i++ ) {
				var ld = data.layer[i];
				var newLayer = new wm.EditMap( ld.name, ld.tilesize, ld.tilesetName, !!ld.foreground );
				newLayer.resize( ld.width, ld.height );
				newLayer.linkWithCollision_1 = ld.linkWithCollision_1;
				newLayer.linkWithCollision_2 = ld.linkWithCollision_2;
				newLayer.visibleToPlayerOne = ld.visibleToPlayerOne;
				newLayer.visibleToPlayerTwo = ld.visibleToPlayerTwo;
				newLayer.repeat = ld.repeat;
				newLayer.preRender = !!ld.preRender;
				newLayer.distance = ld.distance;
				newLayer.visible = !ld.visible;
				newLayer.data = ld.data;
				newLayer.toggleVisibility();
				this.layers.push( newLayer );

				if( ld.name == 'collision_1' ) {
					this.collisionLayer_1 = newLayer;
				}
				else if( ld.name == 'collision_2' ) {
					this.collisionLayer_2 = newLayer;
				}

				this.setActiveLayer( ld.name );
			}

			this.setActiveLayer( 'entities' );

			this.reorderLayers();
			$('#layers').sortable('refresh');

			this.resetModified();
			this.undo.clear();
			this.draw();
		},



		// -------------------------------------------------------------------------
		// Saving

		saveQuick: function() {
			if( this.fileName == 'untitled.js' ) {
				this.saveDialog.open();
			}
			else {
				this.save( null, this.filePath );
			}
		},

		save: function( dialog, path ) {
			if( !path.match(/\.js$/) ) {
				path += '.js';
			}

			this.filePath = path;
			this.fileName = path.replace(/^.*\//,'');
			var data = this.levelData;
			data.entities = this.entities.getSaveData();
			data.layer = [];

			var resources = [];
			for( var i=0; i < this.layers.length; i++ ) {
				var layer = this.layers[i];
				data.layer.push( layer.getSaveData() );
				if( layer.name != 'collision_1' && layer.name != 'collision_2' ) {
					resources.push( layer.tiles.path );
				}
			}


			var dataString = JSON.stringify(data);
			if( wm.config.project.prettyPrint ) {
				dataString = JSONFormat( dataString );
			}

			// Make it an ig.module instead of plain JSON?
			if( wm.config.project.outputFormat == 'module' ) {
				var levelModule = path
					.replace(wm.config.project.modulePath, '')
					.replace(/\.js$/, '')
					.replace(/\//g, '.');

				var levelName = levelModule.replace(/(^.*\.|-)(\w)/g, function( m, s, a ) {
					return a.toUpperCase();
				});


				var resourcesString = '';
				if( resources.length ) {
					resourcesString = "Level" + levelName + "Resources=[new ig.Image('" +
						resources.join("'), new ig.Image('") +
					"')];\n";
				}

				// Collect all Entity Modules
				var requires = ['impact.image'];
				var requiresHash = {};
				for( var i = 0; i < data.entities.length; i++ ) {
					var ec = this.entities.entityClasses[ data.entities[i].type ];
					if( !requiresHash[ec] ) {
						requiresHash[ec] = true;
						requires.push(ec);
					}
				}

				// include /*JSON[*/ ... /*]JSON*/ markers, so we can easily load
				// this level as JSON again
				dataString =
					"ig.module( '"+levelModule+"' )\n" +
					".requires( '"+requires.join("','")+"' )\n" +
					".defines(function(){\n"+
						"Level" + levelName + "=" +
							"/*JSON[*/" + dataString + "/*]JSON*/" +
						";\n" +
						resourcesString +
					"});";
			}

			var postString =
				'path=' + encodeURIComponent( path ) +
				'&data=' + encodeURIComponent(dataString);

			var req = $.ajax({
				url: wm.config.api.save,
				type: 'POST',
				dataType: 'json',
				async: false,
				data: postString,
				success:this.saveResponse.bind(this)
			});
		},

		saveResponse: function( data ) {
			if( data.error ) {
				alert( 'Error: ' + data.msg );
			} else {
				this.resetModified();
				$.cookie( 'wmLastLevel', this.filePath );
			}
		},



		// -------------------------------------------------------------------------
		// Layers

		addLayer: function() {
			var name = 'new_layer_' + this.layers.length;
			var newLayer = new wm.EditMap( name, wm.config.layerDefaults.tilesize );
			newLayer.resize( wm.config.layerDefaults.width, wm.config.layerDefaults.height );
			newLayer.setScreenPos( this.screen.x, this.screen.y );
			this.layers.push( newLayer );
			this.setActiveLayer( name );
			this.updateLayerSettings();

			this.reorderLayers();

			$('#layers').sortable('refresh');
		},


		removeLayer: function() {
			var name = this.activeLayer.name;
			if( name == 'entities' ) {
				return false;
			}
			this.activeLayer.destroy();
			for( var i = 0; i < this.layers.length; i++ ) {
				if( this.layers[i].name == name ) {
					this.layers.splice( i, 1 );
					this.reorderLayers();
					$('#layers').sortable('refresh');
					this.setActiveLayer( 'entities' );
					return true;
				}
			}
			return false;
		},


		getLayerWithName: function( name ) {
			for( var i = 0; i < this.layers.length; i++ ) {
				if( this.layers[i].name == name ) {
					return this.layers[i];
				}
			}
			return null;
		},


		reorderLayers: function( dir ) {
			var newLayers = [];
			var isForegroundLayer = true;
			$('#layers div.layer span.name').each((function( newIndex, span ){
				var name = $(span).text();

				var layer = name == 'entities'
					? this.entities
					: this.getLayerWithName(name);

				if( layer ) {
					layer.setHotkey( newIndex+1 );
					if( layer.name == 'entities' ) {
						// All layers after the entity layer are not foreground
						// layers
						isForegroundLayer = false;
					}
					else {
						layer.foreground = isForegroundLayer;
						newLayers.unshift( layer );
					}
				}
			}).bind(this));
			this.layers = newLayers;
			this.setModified();
			this.draw();
		},


		updateLayerSettings: function( ) {
			$('#layerName').val( this.activeLayer.name );
			$('#layerTileset').val( this.activeLayer.tilesetName );
			$('#layerTilesize').val( this.activeLayer.tilesize );
			$('#layerWidth').val( this.activeLayer.width );
			$('#layerHeight').val( this.activeLayer.height );
			$('#layerPreRender').prop( 'checked', this.activeLayer.preRender );
			$('#layerRepeat').prop( 'checked', this.activeLayer.repeat );
			$('#layerLinkWithCollision_1').prop( 'checked', this.activeLayer.linkWithCollision_1 );
			$('#layerLinkWithCollision_2').prop( 'checked', this.activeLayer.linkWithCollision_2 );
			$('#layerVisibleByPlayerOne').prop( 'checked', this.activeLayer.visibleToPlayerOne );
			$('#layerVisibleByPlayerTwo').prop( 'checked', this.activeLayer.visibleToPlayerTwo );
			$('#layerDistance').val( this.activeLayer.distance );
		},


		saveLayerSettings: function() {
			var isCollision = $('#layerIsCollision_1').prop('checked') | $('#layerIsCollision_2').prop('checked');

			var newName = $('#layerName').val();
			var newWidth = Math.floor($('#layerWidth').val());
			var newHeight = Math.floor($('#layerHeight').val());

			if( newWidth != this.activeLayer.width || newHeight != this.activeLayer.height ) {
				this.activeLayer.resize( newWidth, newHeight );
			}
			this.activeLayer.tilesize = Math.floor($('#layerTilesize').val());

			if( isCollision ) {
				newName = ($('#layerIsCollision_1').prop('checked') ? 'collision_1' : 'collision_2');
				this.activeLayer.linkWithCollision_1 = false;
				this.activeLayer.linkWithCollision_2 = false;
				this.activeLayer.visibleToPlayerOne = false;
				this.activeLayer.visibleToPlayerTwo = false;
				this.activeLayer.distance = 1;
				this.activeLayer.repeat = false;
				this.activeLayer.setCollisionTileset();
			}
			else {
				var newTilesetName = $('#layerTileset').val();
				if( newTilesetName != this.activeLayer.tilesetName ) {
					this.activeLayer.setTileset( newTilesetName );
				}
				this.activeLayer.linkWithCollision_1 = $('#layerLinkWithCollision_1').prop('checked');
				this.activeLayer.linkWithCollision_2 = $('#layerLinkWithCollision_2').prop('checked');
				this.activeLayer.visibleToPlayerOne = $('#layerVisibleByPlayerOne').prop('checked');
				this.activeLayer.visibleToPlayerTwo = $('#layerVisibleByPlayerTwo').prop('checked');;
				this.activeLayer.distance = $('#layerDistance').val();
				this.activeLayer.repeat = $('#layerRepeat').prop('checked');
				this.activeLayer.preRender = $('#layerPreRender').prop('checked');
			}


			if( newName == 'collision_1' ) {
				// is collision layer
				this.collisionLayer_1 = this.activeLayer;
			}
			if( newName == 'collision_2' ) {
				// is collision layer
				this.collisionLayer_2 = this.activeLayer;
			}
			else if( this.activeLayer.name == 'collision_1' ) {
				// was collision layer, but is no more
				this.collisionLayer_1 = null;
			}
			else if( this.activeLayer.name == 'collision_2' ) {
				// was collision layer, but is no more
				this.collisionLayer_2 = null;
			}


			this.activeLayer.setName( newName );
			this.setModified();
			this.draw();
		},


		setActiveLayer: function( name ) {
			var previousLayer = this.activeLayer;
			this.activeLayer = ( name == 'entities' ? this.entities : this.getLayerWithName(name) );
			if( previousLayer == this.activeLayer ) {
				return; // nothing to do here
			}

			if( previousLayer ) {
				previousLayer.setActive( false );
			}
			this.activeLayer.setActive( true );
			this.mode = this.MODE.DEFAULT;

			$('#layerIsCollision_1').prop('checked', (name == 'collision_1') );
			$('#layerIsCollision_2').prop('checked', (name == 'collision_2') );

			if( name == 'entities' ) {
				$('#layerSettings').fadeOut(100);
			}
			else {
				this.entities.selectEntity( null );
				this.toggleCollisionLayer();
				$('#layerSettings')
					.fadeOut(100,this.updateLayerSettings.bind(this))
					.fadeIn(100);
			}
			this.draw();
		},


		toggleCollisionLayer: function( ev ) {
			var isCollision = $('#layerIsCollision_1').prop('checked');
			if (!isCollision)
			 	isCollision = $('#layerIsCollision_2').prop('checked');

			$('#layerLinkWithCollision_1,#layerLinkWithCollision_2,#layerDistance,#layerPreRender,#layerRepeat,#layerName,#layerTileset')
				.attr('disabled', isCollision );
		},



		// -------------------------------------------------------------------------
		// Update

		mousemove: function() {
			if( !this.activeLayer ) {
				return;
			}

			if( this.mode == this.MODE.DEFAULT ) {

				// scroll map
				if( ig.input.state('drag') ) {
					this.drag();
				}

				else if( ig.input.state('draw') ) {

					// move/scale entity
					if( this.activeLayer == this.entities ) {
						var x = ig.input.mouse.x + this.screen.x;
						var y = ig.input.mouse.y + this.screen.y;
						this.entities.dragOnSelectedEntity( x, y );
						this.setModified();
					}

					// draw on map
					else if( !this.activeLayer.isSelecting ) {
						this.setTileOnCurrentLayer();
					}
				}
				else if( this.activeLayer == this.entities ) {
					var x = ig.input.mouse.x + this.screen.x;
					var y = ig.input.mouse.y + this.screen.y;
					this.entities.mousemove( x, y );
				}
			}

			this.mouseLast = {x: ig.input.mouse.x, y: ig.input.mouse.y};
			this.draw();
		},


		keydown: function( action ) {
			if( !this.activeLayer ) {
				return;
			}

			if( action == 'draw' ) {
				if( this.mode == this.MODE.DEFAULT ) {
					// select entity
					if( this.activeLayer == this.entities ) {
						var x = ig.input.mouse.x + this.screen.x;
						var y = ig.input.mouse.y + this.screen.y;
						var entity = this.entities.selectEntityAt( x, y );
						if( entity ) {
							this.undo.beginEntityEdit( entity );
						}
					}
					else {
						if( ig.input.state('select') ) {
							this.activeLayer.beginSelecting( ig.input.mouse.x, ig.input.mouse.y );
						}
						else {
							this.undo.beginMapDraw();
							this.activeLayer.beginEditing();
							if(
								this.activeLayer.linkWithCollision_1 &&
								this.collisionLayer_1 &&
								this.collisionLayer_1 != this.activeLayer
							) {
								this.collisionLayer_1.beginEditing();
							}
							else if(
								this.activeLayer.linkWithCollision_2 &&
								this.collisionLayer_2 &&
								this.collisionLayer_2 != this.activeLayer
							) {
								this.collisionLayer_2.beginEditing();
							}
							this.setTileOnCurrentLayer();
						}
					}
				}
				else if( this.mode == this.MODE.TILESELECT && ig.input.state('select') ) {
					this.activeLayer.tileSelect.beginSelecting( ig.input.mouse.x, ig.input.mouse.y );
				}
			}

			this.draw();
		},


		keyup: function( action ) {
			if( !this.activeLayer ) {
				return;
			}

			if( action == 'delete' ) {
				this.entities.deleteSelectedEntity();
				this.setModified();
			}

			else if( action == 'clone' ) {
				this.entities.cloneSelectedEntity();
				this.setModified();
			}

			else if( action == 'grid' ) {
				wm.config.view.grid = !wm.config.view.grid;
			}

			else if( action == 'menu' ) {
				if( this.mode != this.MODE.TILESELECT && this.mode != this.MODE.ENTITYSELECT ) {
					if( this.activeLayer == this.entities ) {
						this.mode = this.MODE.ENTITYSELECT;
						this.entities.showMenu( ig.input.mouse.x, ig.input.mouse.y );
					}
					else {
						this.mode = this.MODE.TILESELECT;
						this.activeLayer.tileSelect.setPosition( ig.input.mouse.x, ig.input.mouse.y	);
					}
				} else {
					this.mode = this.MODE.DEFAULT;
					this.entities.hideMenu();
				}
			}

			else if( action == 'zoomin' ) {
				this.zoom( 1 );
			}
			else if( action == 'zoomout' ) {
				this.zoom( -1 );
			}


			if( action == 'draw' ) {
				// select tile
				if( this.mode == this.MODE.TILESELECT ) {
					this.activeLayer.brush = this.activeLayer.tileSelect.endSelecting( ig.input.mouse.x, ig.input.mouse.y );
					this.mode = this.MODE.DEFAULT;
				}
				else if( this.activeLayer == this.entities ) {
					this.undo.endEntityEdit();
				}
				else {
					if( this.activeLayer.isSelecting ) {
						this.activeLayer.brush = this.activeLayer.endSelecting( ig.input.mouse.x, ig.input.mouse.y );
					}
					else {
						this.undo.endMapDraw();
					}
				}
			}

			if( action == 'undo' ) {
				this.undo.undo();
			}

			if( action == 'redo' ) {
				this.undo.redo();
			}

			this.draw();
			this.mouseLast = {x: ig.input.mouse.x, y: ig.input.mouse.y};
		},


		setTileOnCurrentLayer: function() {
			if( !this.activeLayer || !this.activeLayer.scroll ) {
				return;
			}

			var co = this.activeLayer.getCursorOffset();
			var x = ig.input.mouse.x + this.activeLayer.scroll.x - co.x;
			var y = ig.input.mouse.y + this.activeLayer.scroll.y - co.y;

			var brush = this.activeLayer.brush;
			for( var by = 0; by < brush.length; by++ ) {
				var brushRow = brush[by];
				for( var bx = 0; bx < brushRow.length; bx++ ) {

					var mapx = x + bx * this.activeLayer.tilesize;
					var mapy = y + by * this.activeLayer.tilesize;

					var newTile = brushRow[bx];
					var oldTile = this.activeLayer.getOldTile( mapx, mapy );

					this.activeLayer.setTile( mapx, mapy, newTile );
					this.undo.pushMapDraw( this.activeLayer, mapx, mapy, oldTile, newTile );


					if(
						this.activeLayer.linkWithCollision_1 &&
						this.collisionLayer_1 &&
						this.collisionLayer_1 != this.activeLayer
					) {
						var collisionLayerTile = newTile > 0 ? this.collisionSolid : 0;

						var oldCollisionTile = this.collisionLayer_1.getOldTile(mapx, mapy);
						this.collisionLayer_1.setTile( mapx, mapy, collisionLayerTile );
						this.undo.pushMapDraw( this.collisionLayer_1, mapx, mapy, oldCollisionTile, collisionLayerTile );
					}
					else if(
						this.activeLayer.linkWithCollision_2 &&
						this.collisionLayer_2 &&
						this.collisionLayer_2 != this.activeLayer
					) {
						var collisionLayerTile = newTile > 0 ? this.collisionSolid : 0;

						var oldCollisionTile = this.collisionLayer_2.getOldTile(mapx, mapy);
						this.collisionLayer_2.setTile( mapx, mapy, collisionLayerTile );
						this.undo.pushMapDraw( this.collisionLayer_2, mapx, mapy, oldCollisionTile, collisionLayerTile );
					}
				}
			}

			this.setModified();
		},


		// -------------------------------------------------------------------------
		// Drawing

		drawIfNeeded: function() {
			// Only draw if flag is set
			if( !this.needsDraw ) { return; }
			this.needsDraw = false;


			ig.system.clear( wm.config.colors.clear );

			var entitiesDrawn = false;
			for( var i = 0; i < this.layers.length; i++ ) {
				var layer = this.layers[i];

				// This layer is a foreground layer? -> Draw entities first!
				if( !entitiesDrawn && layer.foreground ) {
					entitiesDrawn = true;
					this.entities.draw();
				}
				layer.draw();
			}

			if( !entitiesDrawn ) {
				this.entities.draw();
			}


			if( this.activeLayer ) {
				if( this.mode == this.MODE.TILESELECT ) {
					this.activeLayer.tileSelect.draw();
					this.activeLayer.tileSelect.drawCursor( ig.input.mouse.x, ig.input.mouse.y );
				}

				if( this.mode == this.MODE.DEFAULT ) {
					this.activeLayer.drawCursor( ig.input.mouse.x, ig.input.mouse.y );
				}
			}

			if( wm.config.labels.draw ) {
				this.drawLabels( wm.config.labels.step );
			}
		},
	});

	wm.EditMap.inject({
		linkWithCollision_1: false,
		linkWithCollision_2: false,
		visibleToPlayerOne: false,
		visibleToPlayerTwo: false,

		getSaveData: function() {
			return {
				name: this.name,
				width: this.width,
				height: this.height,
				linkWithCollision_1: this.linkWithCollision_1,
				linkWithCollision_2: this.linkWithCollision_2,
				visibleToPlayerOne: this.visibleToPlayerOne,
				visibleToPlayerTwo: this.visibleToPlayerTwo,
				visible: this.visible,
				tilesetName: this.tilesetName,
				repeat: this.repeat,
				preRender: this.preRender,
				distance: this.distance,
				tilesize: this.tilesize,
				foreground: this.foreground,
				data: this.data
			};
		},

		setTileset: function( tileset ) {
			if( this.name == 'collision_1' || this.name == 'collision_2' ) {
				this.setCollisionTileset();
			}
			else {
				this.parent( tileset );
			}
		},
	});
});
