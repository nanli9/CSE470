

var canvas;
var gl;
var program;

// define geometry

var numVertices  = 36;
var pointsArray = [];
var normalsArray = [];

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

// define light properties
// light location specified in eye coordinates
// try different light positions
// wrt cube at origin with width 1
var lightPosition = vec4(2.0, 2.0, 2.0, 1.0 );  
//var lightPosition = vec4(0.0, 0.0, 5.0, 1.0 );  

// higher ambient to test out influence it has with slider
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
//var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

// material properties
var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var temp = vec4(0.0, 0.0, 0.0, 1.0);

var materialAmbScale = 1.0;
var materialDiffScale = 1.0;
var materialSpecScale = 1.0;

var ambientColor, diffuseColor, specularColor;

// eye location and parameters to move
var viewer = 
{
	eye: vec3(0.0, 0.0, 5.0),
	at:  vec3(0.0, 0.0, 0.0),  
	up:  vec3(0.0, 1.0, 0.0),
	
	// for moving around object; set vals so at origin
	radius: 5,
    theta: 0,
    phi: 0
};


var modelView, projection;
 

 

// ================ create geometry functions 
function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);
     normal = normalize(normal);

     pointsArray.push(vertices[a]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[b]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal);   
     pointsArray.push(vertices[a]);  
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[d]); 
     normalsArray.push(normal);    
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

// ========================= run program 

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();
	
	console.log("Start with ");
	console.log("lightAmbient = ",lightAmbient);
	console.log("lightDiffuse = ",lightDiffuse);
	console.log("lightSpecular = ",lightSpecular);
	console.log(" ");
	console.log("materialAmbient = ",materialAmbient);
	console.log("materialDiffuse = ",materialDiffuse);
	console.log("materialSpecular = ",materialSpecular);
	
	

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

  
   
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);
    
	
	projection = ortho(-1, 1, -1, 1, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));
	
	// user interaction
	
	// define mouse event listeners
	mouseControls();
	
	// material sliders
	document.getElementById("ambientSlider").onchange = function() {
        materialAmbScale = event.srcElement.value;
		for(var i=0; i<3; i++)
			temp[i] = materialAmbScale * materialAmbient[i];
		console.log("new materialAmbient = ",temp);
		ambientProduct = mult(lightAmbient, temp);
		gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    };
	
	document.getElementById("diffuseSlider").onchange = function() {
        materialDiffScale = event.srcElement.value;
		for(var i=0; i<3; i++)
			temp[i] = materialDiffScale * materialDiffuse[i];
		console.log("new materialDiffuse = ",temp);
		diffuseProduct = mult(lightDiffuse, temp);
		gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct));
    };
	
	document.getElementById("specularSlider").onchange = function() {
        materialSpecScale = event.srcElement.value;
		for(var i=0; i<3; i++)
			temp[i] = materialSpecScale * materialSpecular[i];
		console.log("new materialSpecular = ",temp);
		specularProduct = mult(lightSpecular, temp);
		gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct));
    };

    
    
    render();
}

// =====================================================
var render = function(){
            
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelViewMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
            
            
    requestAnimFrame(render);
}
