// The WebGL Canvas
var canvas;

// The WebGL Context
var gl;

// Model Center
var modelprop_Center = [0, 0, 0];
var Cur_Center = [0, 0, 0];


  //var meshcolor = new vxColour(0.05, 0.5, 0.75, 1);
    var meshcolor = new vxColour(0.65, 0.65, 0.65, 1);
    var selectedcolor = new vxColour(0.93, 0.463, 0.05, 1);

var modelprop_Radius = 1;

var numOfFaces = 1;


// Render State, Shaded, Wireframe, etc...
//**************************************************
vxRenderState = {
    ShadedEdge: 0,
    Shaded: 1,
    Wireframe: 2
};

var RenderState = vxRenderState.ShadedEdge;



// View Projection Type 
//**************************************************
vxProjectionType = {
    Perspective: 0,
    Ortho: 1
};

var ProjectionType = vxProjectionType.Perspective;



//The Selection Index
var HoverIndex = 0;


//This is a collection of all of the current models. A model is defined as a 
// individual file.
var ModelCollection = [];

//This is a collection of all of the current meshes
var MeshCollection = [];

//This is a collection of all of the current meshes
var SelectedMeshCollection = [];

//Grid Variables
var GridMesh = new vxMesh('GridMesh');
var XAxisMesh = new vxMesh('X Axis');
var YAxisMesh = new vxMesh('Y Axis');
var ZAxisMesh = new vxMesh('Z Axis');
var HoveredMesh = new vxMesh('Hovered Mesh');

var ViewCenter = new vxVertex3D();

//var cubeVerticesIndexBuffer;
var numOfElements = 0;
var rotX = -45;
var rotY = 30;

var currotX = 0;
var currotY = 0;
var curZoom = 0;

var lastCubeUpdateTime = 0;

var Zoom = -100;

var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var vertexColorAttribute;
var vertexSelColorAttribute;
var hasTextureAttribute;
var perspectiveMatrix;
var elmntID;

var MouseState = {
    x: 0,
    y: 0,
    LeftButtonDown: false,
    MiddleButtonDown: false,
    RightButtonDown: false
};

var KeyboardState = {
    Shift: false,
};

var meshNodeId = "node_mesh";

window.onload = function() {

    canvas = document.getElementById('glcanvas3D');

    //Initialise Web GL
    webGLStart();

    //Initialise Input Handlers
    InitInputHandlers();

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    canvas.onmousemove = handleMouseMove;


    //var myimage = document.getElementById(elmntID);
    if (canvas.addEventListener) {
        // IE9, Chrome, Safari, Opera
        canvas.addEventListener("mousewheel", MouseWheelHandler, false);
        // Firefox
        canvas.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
    }
    // IE 6/7/8
    else canvas.attachEvent("onmousewheel", MouseWheelHandler);

    Resize();

    /*
    <input type="checkbox" id="node-0-0" checked="checked" />
    <label><input type="checkbox" />
    <span></span></label>
    <label for="node-0-0">Documents</label>
    
  <li>
    <input type="checkbox" id="node-0-1-0" />
    
    <label>
      <input type="checkbox" />
      <span></span>
    </label>
    
    <label for="node-0-1-0">My Music</label>
  </li>
    */
    AddTreeNode("node_origin", "Origin", "tree_root", "folder", true);
    /*
    AddTreeNode("node_axis", "Axis'", "node_origin", "folder", true);
    
    AddTreeNode("node_axis_x", "X-Axis", "node_axis", "axis");
    AddTreeNode("node_axis_y", "Y-Axis", "node_axis", "axis");
    AddTreeNode("node_axis_z", "Z-Axis", "node_axis", "axis");
    
    AddTreeNode("node_planes", "Planes", "node_origin", "folder", true);
    
    AddTreeNode("node_origin_x", "XY-Planes", "node_planes", "plane");
    AddTreeNode("node_origin_y", "YZ-Planes", "node_planes", "plane");
    AddTreeNode("node_origin_z", "XZ-Planes", "node_planes", "plane");
    */
    AddTreeNode(meshNodeId, "Meshes", "tree_root", "folder", true);


};

function AddTreeNode(id, labelText, rootToAddTo) {
    AddTreeNode(id, labelText, rootToAddTo, "");
}

function AddTreeNode(id, labelText, rootToAddTo, icon) {
    AddTreeNode(id, labelText, rootToAddTo, "", true);
}

function AddTreeNode(id, labelText, rootToAddTo, icon, isExpanded) {
  
    // First get the tree root
    var rootNode = document.getElementById(rootToAddTo + "_ul");

    // Next create the li element which will encapslate the entire tree node GUI item
    var li = document.createElement("li");

    //Now Add an Input

    //     <input type="checkbox" id="node-0-1-0" />
    var inp1 = document.createElement("INPUT");
    inp1.setAttribute("type", "checkbox"); // added line
    inp1.setAttribute("id", id); // added line

    if (isExpanded === true)
        inp1.setAttribute("checked", "true"); // added line

    li.appendChild(inp1);

    // Now Create the Nested label which holds the check box
    var chkLbl = document.createElement("LABEL");

    var inp2 = document.createElement("INPUT");
    inp2.setAttribute("id", id); // added line
    inp2.setAttribute("type", "checkbox"); // added line
    inp2.setAttribute("checked", "checked"); // added line
    chkLbl.appendChild(inp2);

    var spn = document.createElement("SPAN");
    chkLbl.appendChild(spn);

    li.appendChild(chkLbl);

    // Finally create the end Text
    var txtLbl = document.createElement("LABEL");
    var txt = document.createTextNode(labelText);
    txtLbl.setAttribute("for", id);
    txtLbl.setAttribute("data-icon", icon);
    txtLbl.appendChild(txt);
    li.appendChild(txtLbl);

    // Finally Append a 'ul' element so that it can parent other nodes
    var newul = document.createElement("ul");
    newul.setAttribute("id", id + "_ul"); // added line
    li.appendChild(newul);

    rootNode.appendChild(li);


}

function InitialiseModel(model)
{
  model.Init();
  
}



$(window).resize(function() {

    Resize();
});

// Handles Resizing
function Resize() {
    canvas.width = $(window).width();
    canvas.height = $(window).height() - 50;
    
    
    var footer = document.getElementById('div_footer');
    
    //footer.bottom = -30 + "px";
    //footer.left = 0 + "px";

    gl.viewport(0, 0, canvas.width, canvas.height);
}







// Handle Tree View Checkbox Toggle
// *****************************************************************************************************
$(".acidjs-css3-treeview").delegate("label input:checkbox", "change", function() {
    var
        checkbox = $(this),
        nestedList = checkbox.parent().next().next(),
        selectNestedListCheckbox = nestedList.find("label:not([for]) input:checkbox");


    if ($(checkbox).attr('id') == meshNodeId) {
        for (var i = 0; i < MeshCollection.length; i++) {

            MeshCollection[i].Enabled = checkbox.is(":checked");
        }
    } else {

        for (var i = 0; i < MeshCollection.length; i++) {

            if ("node_" + MeshCollection[i].Name == $(checkbox).attr('id')) {
                MeshCollection[i].Enabled = checkbox.is(":checked");
            }

        }
    }
    /*
          console.log($(checkbox).attr('id'));
        console.log(checkbox.is(":checked"));
        */
    if (checkbox.is(":checked")) {
        return selectNestedListCheckbox.prop("checked", true);
    }
    selectNestedListCheckbox.prop("checked", false);
});







// Handles Logging of Text
// *****************************************************************************************************
function log(Text) {
    console.log(Text);
    //var TextSoFar = $('#console').html();

    //TextSoFar += new Date() + ">> " + Text + "<br/>";

    //$('#console').html(TextSoFar);

    //$('#sonsoleDiv').animate({scrollTop: $('#sonsoleDiv').prop("scrollHeight")}, 50);
}





(function() {
  
  "use strict";

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //
  // H E L P E R    F U N C T I O N S
  //
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Function to check if we clicked inside an element with a particular class
   * name.
   * 
   * @param {Object} e The event
   * @param {String} className The class name to check against
   * @return {Boolean}
   */
  function clickInsideElement( e, className ) {
    var el = e.srcElement || e.target;
    
    if ( el.classList.contains(className) ) {
      return el;
    } else {
      while ( el = el.parentNode ) {
        if ( el.classList && el.classList.contains(className) ) {
          return el;
        }
      }
    }

    return false;
  }

  /**
   * Get's exact position of event.
   * 
   * @param {Object} e The event passed in
   * @return {Object} Returns the x and y position
   */
  function getPosition(e) {
    var posx = 0;
    var posy = 0;

    if (!e) var e = window.event;
    
    if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
    } else if (e.clientX || e.clientY) {
      posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return {
      x: posx,
      y: posy
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //
  // C O R E    F U N C T I O N S
  //
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  
  /**
   * Variables.
   */
  var contextMenuClassName = "context-menu";
  var contextMenuItemClassName = "context-menu__item";
  var contextMenuLinkClassName = "context-menu__link";
  var contextMenuActive = "context-menu--active";

  var taskItemClassName = "glcanvas3D";
  var taskItemInContext;

  var clickCoords;
  var clickCoordsX;
  var clickCoordsY;

  var menu = document.querySelector("#context-menu");
  var menuItems = menu.querySelectorAll(".context-menu__item");
  var menuState = 0;
  var menuWidth;
  var menuHeight;
  var menuPosition;
  var menuPositionX;
  var menuPositionY;

  var windowWidth;
  var windowHeight;

  /**
   * Initialise our application's code.
   */
  function init() {
    contextListener();
    clickListener();
    keyupListener();
    resizeListener();
  }

  /**
   * Listens for contextmenu events.
   */
  function contextListener() {
    document.addEventListener( "contextmenu", function(e) {
      taskItemInContext = clickInsideElement( e, taskItemClassName );
//e.preventDefault();
      if ( taskItemInContext ) {
        e.preventDefault();
        toggleMenuOn();
        positionMenu(e);
      } else {
        taskItemInContext = null;
        toggleMenuOff();
      }
    });
  }

  /**
   * Listens for click events.
   */
  function clickListener() {
    document.addEventListener( "click", function(e) {
      var clickeElIsLink = clickInsideElement( e, contextMenuLinkClassName );

      if ( clickeElIsLink ) {
        e.preventDefault();
        menuItemListener( clickeElIsLink );
      } else {
        var button = e.which || e.button;
        if ( button === 1 ) {
          toggleMenuOff();
        }
      }
    });
  }

  /**
   * Listens for keyup events.
   */
  function keyupListener() {
    window.onkeyup = function(e) {
      if ( e.keyCode === 27 ) {
        toggleMenuOff();
      }
    }
  }

  /**
   * Window resize event listener
   */
  function resizeListener() {
    window.onresize = function(e) {
      toggleMenuOff();
    };
  }

  /**
   * Turns the custom context menu on.
   */
  function toggleMenuOn() {
    if ( menuState !== 1 ) {
      menuState = 1;
      menu.classList.add( contextMenuActive );
    }
  }

  /**
   * Turns the custom context menu off.
   */
  function toggleMenuOff() {
    if ( menuState !== 0 ) {
      menuState = 0;
      menu.classList.remove( contextMenuActive );
    }
  }

  /**
   * Positions the menu properly.
   * 
   * @param {Object} e The event
   */
  function positionMenu(e) {
    clickCoords = getPosition(e);
    clickCoordsX = clickCoords.x;
    clickCoordsY = clickCoords.y;

    menuWidth = menu.offsetWidth + 4;
    menuHeight = menu.offsetHeight + 4;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    if ( (windowWidth - clickCoordsX) < menuWidth ) {
      menu.style.left = windowWidth - menuWidth + "px";
    } else {
      menu.style.left = clickCoordsX + "px";
    }

    if ( (windowHeight - clickCoordsY) < menuHeight ) {
      menu.style.top = windowHeight - menuHeight + "px";
    } else {
      menu.style.top = clickCoordsY + "px";
    }
  }

  /**
   * Dummy action function that logs an action when a menu item link is clicked
   * 
   * @param {HTMLElement} link The link that was clicked
   */
  function menuItemListener( link ) {
    console.log( "Task ID - " + taskItemInContext.getAttribute("data-id") + ", Task action - " + link.getAttribute("data-action"));
    toggleMenuOff();
  }

  /**
   * Run the app.
   */
  init();

})();