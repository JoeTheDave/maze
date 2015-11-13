//global variables
var dimensionX = 30;
var dimensionY = 30;
var squareWidth = 20;
var mazeSegmentLength = 5;

var maze = null;
var moves = 0;


//page Load
$(function () {
    maze = CreateMazeObject('.main-container', dimensionX, dimensionY);
    maze.Initialize();

    document.onkeyup = function (e) {
        var KeyID = (window.event) ? event.keyCode : e.keyCode;
        if (KeyID == 38) {
            //up
            if (maze.currentPosition.nNeighbor != null && maze.currentPosition.nWall == false) {
                maze.currentPosition.jQ.removeClass('currentPosition');
                maze.currentPosition = maze.currentPosition.nNeighbor;
                maze.currentPosition.jQ.addClass('currentPosition');
                moves++;
            }
        } else if (KeyID == 39) {
            //right
            if (maze.currentPosition.eNeighbor != null && maze.currentPosition.eWall == false) {
                maze.currentPosition.jQ.removeClass('currentPosition');
                maze.currentPosition = maze.currentPosition.eNeighbor;
                maze.currentPosition.jQ.addClass('currentPosition');
                moves++;
            }
        } else if (KeyID == 40) {
            //down
            if (maze.currentPosition.sNeighbor != null && maze.currentPosition.sWall == false) {
                maze.currentPosition.jQ.removeClass('currentPosition');
                maze.currentPosition = maze.currentPosition.sNeighbor;
                maze.currentPosition.jQ.addClass('currentPosition');
                moves++;
            }
        } else if (KeyID == 37) {
            //left
            if (maze.currentPosition.wNeighbor != null && maze.currentPosition.wWall == false) {
                maze.currentPosition.jQ.removeClass('currentPosition');
                maze.currentPosition = maze.currentPosition.wNeighbor;
                maze.currentPosition.jQ.addClass('currentPosition');
                moves++;
            }
        }
        if (maze.currentPosition.isExit) {
            alert('You Win - Efficiency: ' + (Math.floor(((maze.mazeDistance + 1) / moves) * 10000) / 100) + '%');
        }
    }
	
	$('#btnShowPath').click(function() {
		$(this).attr('disabled', 'disabled');
		$('.mazePath').css('background-color', '#FF6666');
		$('.mazePath').animate({backgroundColor: '#FFFFFF'}, 5000, function() {
			
			$('#btnShowPath').removeAttr('disabled');
		});
	});
});

function CreateMazeSection(id) {
    return {
        ID: id,
        jQ: null,
        nNeighbor: null,
        eNeighbor: null,
        sNeighbor: null,
        wNeighbor: null,
        nWall: true,
        eWall: true,
        sWall: true,
        wWall: true,
        isEntrance: false,
        isOnEntrancePath: false,
        isExit: false,
        isOnExitPath: false,
		isOnMazePath: false,
        distanceFromOpening: 0,
        WallCount: function () {
            var walls = 0;
            if (this.nWall) { walls++; }
            if (this.eWall) { walls++; }
            if (this.sWall) { walls++; }
            if (this.wWall) { walls++; }
            return walls;
        },
        NeighborCount: function () {
            var neighbors = 0;
            if (this.nNeighbor) { neighbors++; }
            if (this.eNeighbor) { neighbors++; }
            if (this.sNeighbor) { neighbors++; }
            if (this.wNeighbor) { neighbors++; }
            return neighbors;
        },
        RandomIsolatedNeighbor: function () {
            var options = [];
            if (this.nNeighbor != null && (!this.nNeighbor.isOnEntrancePath) && (!this.nNeighbor.isOnExitPath)) { options.push(this.nNeighbor) }
            if (this.eNeighbor != null && (!this.eNeighbor.isOnEntrancePath) && (!this.eNeighbor.isOnExitPath)) { options.push(this.eNeighbor) }
            if (this.sNeighbor != null && (!this.sNeighbor.isOnEntrancePath) && (!this.sNeighbor.isOnExitPath)) { options.push(this.sNeighbor) }
            if (this.wNeighbor != null && (!this.wNeighbor.isOnEntrancePath) && (!this.wNeighbor.isOnExitPath)) { options.push(this.wNeighbor) }
            if (options.length > 0) {
                return options[Math.floor(Math.random() * options.length)];
            }
            else {
                return null;
            }
        }
    };
}

function CreateMazeObject(elementSelector, dimensionX, dimensionY) {
    return {
        dimX: dimensionX,
        dimY: dimensionY,
        jQ: $(elementSelector),
        sections: [],
        wallSections: [],
        cornerSections: [],
        onPathSections: [],
        mazeEntrance: null,
        mazeExit: null,
        mazeDistance: 0,
        currentPosition: null,
        Initialize: function () {
            //Resize Container
            this.jQ.css('width', ((dimensionX * (squareWidth + 2)) + 2) + 'px');
            //Create Maze Sections
            for (var x = 0; x < this.dimX * this.dimY; x++) {
                this.sections.push(CreateMazeSection(x));
            }
            //InterLink Maze Sections
            for (var x = 0; x < this.sections.length; x++) {
                if ((x + 1) % this.dimX != 0) {
                    this.sections[x].eNeighbor = this.sections[x + 1];
                }
                if (x % this.dimX != 0) {
                    this.sections[x].wNeighbor = this.sections[x - 1];
                }
                if (x > this.dimX - 1) {
                    this.sections[x].nNeighbor = this.sections[x - this.dimX];
                }
                if (x < (this.dimX * this.dimY) - this.dimX) {
                    this.sections[x].sNeighbor = this.sections[x + this.dimX];
                }
            }
            //Identify Maze Walls and Corners
            var section = this.sections[0];
            var dir = 1;
            do {
                this.wallSections.push(section);
                if (dir == 1) { if (section.eNeighbor != null) { section = section.eNeighbor; } else { dir = 2; } }
                if (dir == 2) { if (section.sNeighbor != null) { section = section.sNeighbor; } else { dir = 3; } }
                if (dir == 3) { if (section.wNeighbor != null) { section = section.wNeighbor; } else { dir = 4; } }
                if (dir == 4) { if (section.nNeighbor != null) { section = section.nNeighbor; } else { dir = 1; } }
            } while (section.ID != 0);
            //Build a New Maze
            this.NewMaze();
        }, //End of Initialize function
        NewMaze: function () {
            //Display Maze Content
            var content = '';
            for (var x = 0; x < this.sections.length; x++) {
                content += '<div id="square-' + x + '" class="square" style="width:' + squareWidth + 'px; height:' + squareWidth + 'px; border-top:solid ' + (this.sections[x].nNeighbor == null ? '2' : '1') + 'px #000000; border-right:solid ' + (this.sections[x].eNeighbor == null ? '2' : '1') + 'px #000000; border-bottom:solid ' + (this.sections[x].sNeighbor == null ? '2' : '1') + 'px #000000; border-left:solid ' + (this.sections[x].wNeighbor == null ? '2' : '1') + 'px #000000;"></div>';
                if (this.sections[x].eNeighbor == null) {
                    content += '<div class="clear"></div>';
                }
            }
            this.jQ.html(content);
            //Populate Section jQ Elements
            for (var x = 0; x < this.sections.length; x++) {
                this.sections[x].jQ = $('#square-' + x);
            }
            //Place Maze Entrance/Exit
            this.mazeEntrance = null;
            this.mazeExit = null;
            while (this.mazeEntrance == null) {
                var attempt = Math.floor(Math.random() * this.wallSections.length);
                if (this.wallSections[attempt].NeighborCount() == 3) {
                    this.mazeEntrance = this.wallSections[attempt];
                    this.mazeEntrance.isEntrance = true;
                    this.mazeEntrance.isOnEntrancePath = true;
                    this.onPathSections.push(this.mazeEntrance);
                    if (this.mazeEntrance.nNeighbor == null) { this.mazeEntrance.jQ.css('border-top', 'solid 2px #FFFFFF'); }
                    if (this.mazeEntrance.eNeighbor == null) { this.mazeEntrance.jQ.css('border-right', 'solid 2px #FFFFFF'); }
                    if (this.mazeEntrance.sNeighbor == null) { this.mazeEntrance.jQ.css('border-bottom', 'solid 2px #FFFFFF'); }
                    if (this.mazeEntrance.wNeighbor == null) { this.mazeEntrance.jQ.css('border-left', 'solid 2px #FFFFFF'); }

                    this.mazeExit = this.wallSections[(attempt + (this.wallSections.length / 2) > this.wallSections.length - 1) ? (attempt + (this.wallSections.length / 2) - this.wallSections.length) : (attempt + (this.wallSections.length / 2))];
                    this.mazeExit.isExit = true;
                    this.mazeExit.isOnExitPath = true;
                    this.onPathSections.push(this.mazeExit);
                    if (this.mazeExit.nNeighbor == null) { this.mazeExit.jQ.css('border-top', 'solid 2px #FFFFFF'); }
                    if (this.mazeExit.eNeighbor == null) { this.mazeExit.jQ.css('border-right', 'solid 2px #FFFFFF'); }
                    if (this.mazeExit.sNeighbor == null) { this.mazeExit.jQ.css('border-bottom', 'solid 2px #FFFFFF'); }
                    if (this.mazeExit.wNeighbor == null) { this.mazeExit.jQ.css('border-left', 'solid 2px #FFFFFF'); }
                }
            }
            //Build Maze Path
            this.PathFind(this.mazeEntrance)
            this.PathFind(this.mazeExit)
            do {
                var proposedSection = null;
                while (proposedSection == null) {
                    proposedSection = this.onPathSections[Math.floor(Math.random() * this.onPathSections.length)];
                    if (proposedSection.RandomIsolatedNeighbor() == null) {
                        proposedSection = null;
                    }
                }
                this.PathFind(proposedSection);
            } while (this.Completeness() < 1.00);
            //Connect Entrance and Exit Paths
            var section1 = null;
            var section2 = null;
            var distance = 0;
            for (var x = 0; x < this.sections.length; x++) {
                if ((this.sections[x].eNeighbor != null) && ((this.sections[x].isOnEntrancePath && this.sections[x].eNeighbor.isOnExitPath) || (this.sections[x].isOnExitPath && this.sections[x].eNeighbor.isOnEntrancePath))) {
                    if (this.sections[x].distanceFromOpening + this.sections[x].eNeighbor.distanceFromOpening > distance) {
                        distance = this.sections[x].distanceFromOpening + this.sections[x].eNeighbor.distanceFromOpening;
                        section1 = this.sections[x];
                        section2 = this.sections[x].eNeighbor;
                    }
                }
                if ((this.sections[x].sNeighbor != null) && ((this.sections[x].isOnEntrancePath && this.sections[x].sNeighbor.isOnExitPath) || (this.sections[x].isOnExitPath && this.sections[x].sNeighbor.isOnEntrancePath))) {
                    if (this.sections[x].distanceFromOpening + this.sections[x].sNeighbor.distanceFromOpening > distance) {
                        distance = this.sections[x].distanceFromOpening + this.sections[x].sNeighbor.distanceFromOpening;
                        section1 = this.sections[x];
                        section2 = this.sections[x].sNeighbor;
                    }
                }
            }
            this.mazeDistance = distance;
            this.CombineSections(section1, section2, false);
            this.mazeExit.jQ.addClass('mazeExit');
            this.currentPosition = this.mazeEntrance;
            this.currentPosition.jQ.addClass('currentPosition');
			//Define Actual Maze Path
			var cursor = section1;
			while (cursor.distanceFromOpening > 0) {
				cursor.jQ.addClass('mazePath');
				cursor.isOnMazePath = true;
				if (cursor.nWall == false && cursor.nNeighbor != null && cursor.nNeighbor.isOnEntrancePath == cursor.isOnEntrancePath && cursor.nNeighbor.distanceFromOpening == cursor.distanceFromOpening - 1) { 
					cursor = cursor.nNeighbor; 
				} 
				else if (cursor.eWall == false && cursor.eNeighbor != null && cursor.eNeighbor.isOnEntrancePath == cursor.isOnEntrancePath && cursor.eNeighbor.distanceFromOpening == cursor.distanceFromOpening - 1) { 
					cursor = cursor.eNeighbor; 
				} 
				else if (cursor.sWall == false && cursor.sNeighbor != null && cursor.sNeighbor.isOnEntrancePath == cursor.isOnEntrancePath && cursor.sNeighbor.distanceFromOpening == cursor.distanceFromOpening - 1) { 
					cursor = cursor.sNeighbor; 
				} 
				else if (cursor.wWall == false && cursor.wNeighbor != null && cursor.wNeighbor.isOnEntrancePath == cursor.isOnEntrancePath && cursor.wNeighbor.distanceFromOpening == cursor.distanceFromOpening - 1) { 
					cursor = cursor.wNeighbor; 
				} 
			}
			cursor = section2;
			while (cursor.distanceFromOpening > 0) {
				cursor.jQ.addClass('mazePath');
				cursor.isOnMazePath = true;
				if (cursor.nWall == false && cursor.nNeighbor != null && cursor.nNeighbor.isOnEntrancePath == cursor.isOnEntrancePath && cursor.nNeighbor.distanceFromOpening == cursor.distanceFromOpening - 1) { 
					cursor = cursor.nNeighbor; 
				} 
				else if (cursor.eWall == false && cursor.eNeighbor != null && cursor.eNeighbor.isOnEntrancePath == cursor.isOnEntrancePath && cursor.eNeighbor.distanceFromOpening == cursor.distanceFromOpening - 1) { 
					cursor = cursor.eNeighbor; 
				} 
				else if (cursor.sWall == false && cursor.sNeighbor != null && cursor.sNeighbor.isOnEntrancePath == cursor.isOnEntrancePath && cursor.sNeighbor.distanceFromOpening == cursor.distanceFromOpening - 1) { 
					cursor = cursor.sNeighbor; 
				} 
				else if (cursor.wWall == false && cursor.wNeighbor != null && cursor.wNeighbor.isOnEntrancePath == cursor.isOnEntrancePath && cursor.wNeighbor.distanceFromOpening == cursor.distanceFromOpening - 1) { 
					cursor = cursor.wNeighbor; 
				} 
			}
        },
        CombineSections: function (section1, section2, progressive) {
			if (typeof progressive == 'undefined') { progressive = true }
            if (section1.nNeighbor != null && section1.nNeighbor.ID == section2.ID) {
                section1.nWall = false;
                section1.jQ.css('border-top', 'solid 1px #FFFFFF');
                section2.sWall = false;
                section2.jQ.css('border-bottom', 'solid 1px #FFFFFF');
            }
            else if (section1.eNeighbor != null && section1.eNeighbor.ID == section2.ID) {
                section1.eWall = false;
                section1.jQ.css('border-right', 'solid 1px #FFFFFF');
                section2.wWall = false;
                section2.jQ.css('border-left', 'solid 1px #FFFFFF');
            }
            else if (section1.sNeighbor != null && section1.sNeighbor.ID == section2.ID) {
                section1.sWall = false;
                section1.jQ.css('border-bottom', 'solid 1px #FFFFFF');
                section2.nWall = false;
                section2.jQ.css('border-top', 'solid 1px #FFFFFF');
            }
            else if (section1.wNeighbor != null && section1.wNeighbor.ID == section2.ID) {
                section1.wWall = false;
                section1.jQ.css('border-left', 'solid 1px #FFFFFF');
                section2.eWall = false;
                section2.jQ.css('border-right', 'solid 1px #FFFFFF');
            }
            if (progressive) { 
				if (section1.isOnEntrancePath) { section2.isOnEntrancePath = true; }
				if (section1.isOnExitPath) { section2.isOnExitPath = true; }
				section2.distanceFromOpening = section1.distanceFromOpening + 1; 
			}
        },
        PathFind: function (extender) {
            for (var x = 0; x < mazeSegmentLength; x++) {
                var next = extender.RandomIsolatedNeighbor();
                if (next != null) {
                    this.CombineSections(extender, next);
                    this.onPathSections.push(next);
                    extender = next;
                }
                else {
                    break;
                }
            }
        },
        Completeness: function () {
            return this.onPathSections.length / this.sections.length
        }
    };
}