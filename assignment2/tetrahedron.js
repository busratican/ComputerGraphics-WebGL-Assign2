"use strict";

var canvas;
var gl;

var coordinateVertices = [
    -20, 0, 0,
    20, 0, 0,
    0, -20, 0,
    0, 20, 0,
    0, 0, -20,
    0, 0, 20
 ];

var coordinateColors = [
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 )  // green
 ];

var tetrahedronVertices = [
  // Front face
         0.0,  1.0,  0.0,
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
        // Right face
         0.0,  1.0,  0.0,
         1.0, -1.0,  1.0,
         1.0, -1.0, -1.0,
        // Back face
         0.0,  1.0,  0.0,
         1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        // Left face
         0.0,  1.0,  0.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0
];

var tetrahedronColors = [
    // Front face
    vec4( 1.0, 0.0, 0.0, 1.0 ),  
    vec4( 1.0, 0.0, 0.0, 1.0 ),
    vec4( 1.0, 0.0, 0.0, 1.0 ),

	  vec4( 0.0, 1.0, 0.0, 1.0 ),  
     vec4( 0.0, 1.0, 0.0, 1.0 ),  
      vec4( 0.0, 1.0, 0.0, 1.0 ),  

	   vec4( 0.0, 0.0, 1.0, 1.0 ),
     vec4( 0.0, 0.0, 1.0, 1.0 ),
    vec4( 0.0, 0.0, 1.0, 1.0 ),

   vec4( 0.0, 1.0, 1.0, 1.0 ),  
   vec4( 0.0, 1.0, 1.0, 1.0 ),  
    vec4( 0.0, 1.0, 1.0, 1.0 ) 


];

var near = 0.3;
var far = 11.0;
var eyeX = 1;
var eyeY = 2;
var eyeZ = 5;
var tarX = 0;
var tarY = 0;
var tarZ = 0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var eye = vec3(1.0, 1.0, 5.0);
var at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var axes_vBuffer, axes_cBuffer;
var vPosition, vColor;
var tetrahedron_vBuffer, tetrahedron_cBuffer;

var angleYUniformLoc, angleZUniformLoc;
var translationMatrixLoc;
var scaleXUniformLoc, scaleYUniformLoc, scaleZUniformLoc;

var positionX=0;
var positionY=0;
var positionZ=0;
var scaleXVal=1;
var scaleYVal=1;
var scaleZVal=1;

//modify this function to initialize the shape
window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    aspect =  canvas.width/canvas.height;

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	angleYUniformLoc = gl.getUniformLocation(program,"angleY");
    angleZUniformLoc= gl.getUniformLocation(program,"angleZ");

    translationMatrixLoc = gl.getUniformLocation(program,"translationMatrix");

    scaleXUniformLoc=gl.getUniformLocation(program,"scaleX");
    scaleYUniformLoc=gl.getUniformLocation(program,"scaleY");
    scaleZUniformLoc=gl.getUniformLocation(program,"scaleZ");

    axes_vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, axes_vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(coordinateVertices), gl.STATIC_DRAW);
    axes_vBuffer.itemSize = 3;
    axes_vBuffer.numItems = 6;
	
    axes_cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, axes_cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(coordinateColors), gl.STATIC_DRAW );
    axes_cBuffer.itemSize = 4;
    axes_cBuffer.numItems = 6;

	
	vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, axes_vBuffer.itemSize, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, axes_cBuffer.itemSize, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);
	
	



	
	tetrahedron_vBuffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,tetrahedron_vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(tetrahedronVertices),gl.STATIC_DRAW);
    tetrahedron_vBuffer.itemSize=3;
	tetrahedron_vBuffer.numItems=12;


	tetrahedron_cBuffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,tetrahedron_cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(tetrahedronColors),gl.STATIC_DRAW);
	tetrahedron_cBuffer.itemSize=4;
	tetrahedron_cBuffer.numItems=12;

  

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
 

    // sliders for viewing parameters
    document.getElementById("fovySlider").oninput = function(event) {
         fovy = document.getElementById("fovySlider").value;
    };

    document.getElementById("objRotationYSlider").oninput = function(event) {
    //theta= document.getElementById("objectRotationYSlider").value*Math.PI/180.0;
    };

    document.getElementById("objRotationZSlider").oninput = function(event) {
    //  theta =document.getElementById("objectRotationZSlider").value*Math.PI/180.0;
    };

    document.getElementById("inp_tarX").onchange = function(event) {
        tarX = document.getElementById("inp_tarX").value;
    };
    document.getElementById("inp_tarY").onchange = function(event) {
       tarY = document.getElementById("inp_tarY").value;
    };
    document.getElementById("inp_tarZ").onchange = function(event) {
       tarZ = document.getElementById("inp_tarZ").value;
    };
    document.getElementById("inp_camX").onchange = function(event) {
        eyeX = document.getElementById("inp_camX").value;
    };
    document.getElementById("inp_camY").onchange = function(event) {
       eyeY = document.getElementById("inp_camY").value;
    };
    document.getElementById("inp_camZ").onchange = function(event) {
       eyeZ = document.getElementById("inp_camZ").value;
    };
    document.getElementById("inp_objX").onchange = function(event) {
     positionX =document.getElementById("inp_objX").value;
    };
    document.getElementById("inp_objY").onchange = function(event) {
       positionY= document.getElementById("inp_objY").value;
    };
    document.getElementById("inp_objZ").onchange = function(event) {
      positionZ =document.getElementById("inp_objZ").value;
    };
    document.getElementById("inp_obj_scaleX").onchange = function(event) {
     scaleXVal=document.getElementById("inp_obj_scaleX").value == 0 ? 1: document.getElementById("inp_obj_scaleX").value ;

    };
    document.getElementById("inp_obj_scaleY").onchange = function(event) {
       scaleYVal=document.getElementById("inp_obj_scaleY").value == 0 ? 1: document.getElementById("inp_obj_scaleY").value ;

    };
    document.getElementById("inp_obj_scaleZ").onchange = function(event) {
       scaleZVal=document.getElementById("inp_obj_scaleZ").value == 0 ? 1: document.getElementById("inp_obj_scaleZ").value ;

    };
   
    render();
}


function drawAxes(){

    gl.bindBuffer(gl.ARRAY_BUFFER, axes_vBuffer);
    gl.vertexAttribPointer(vPosition, axes_vBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, axes_cBuffer);
    gl.vertexAttribPointer(vColor, axes_cBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
gl.uniform1f(angleYUniformLoc,radians(0));
gl.uniform1f(angleZUniformLoc,radians(0));
   

gl.uniform4f(translationMatrixLoc,0.0,0.0,0.0,0.0);

gl.uniform1f(scaleXUniformLoc,1);
gl.uniform1f(scaleYUniformLoc,1);
gl.uniform1f(scaleZUniformLoc,1);

    gl.drawArrays(gl.LINES, 0, 6);
    
}

//modify this function to render the shape and apply transformations
var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(eyeX, eyeY, eyeZ);
    at = vec3(tarX, tarY, tarZ);
	
	
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);
   

	
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
   

    drawAxes();
    drawTetrahedron();
    requestAnimFrame(render);
}

function drawTetrahedron()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedron_vBuffer);
    gl.vertexAttribPointer(vPosition, tetrahedron_vBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedron_cBuffer);
    gl.vertexAttribPointer(vColor, tetrahedron_cBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.uniform1f(angleYUniformLoc,radians(document.getElementById("objRotationYSlider").value));
    gl.uniform1f(angleZUniformLoc,radians(document.getElementById("objRotationZSlider").value));

   gl.uniform4f(translationMatrixLoc,positionX,positionY,positionZ, 0, 0);


 gl.uniform1f(scaleXUniformLoc,scaleXVal);
 gl.uniform1f(scaleYUniformLoc,scaleYVal);
 gl.uniform1f(scaleZUniformLoc,scaleZVal);
 gl.drawArrays(gl.TRIANGLES,0, tetrahedron_vBuffer.numItems);
}