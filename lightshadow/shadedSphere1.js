

var canvas;
var gl;
var program;

// sphere definition
var numTimesToSubdivide = 4;
var numVertices = 0;
var pointsArray = [];
var normalsArray = [];

// eye location and parameters to move
var viewer = 
{
	eye: vec3(0.0, 0.0, 3.0),
	at:  vec3(0.0, 0.0, 0.0),  
	up:  vec3(0.0, 1.0, 0.0),
	
	// for moving around object; set vals so at origin
	radius: 3,
    theta: 0,
    phi: 0
};
 

// ortho box
var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;
var near = 0.01;
var farFactor = 3.0;
var far = viewer.radius * farFactor;


// initialize for sphere created by repeated subdivision of tetrahedron
var va = vec3(0.0, 0.0, -1.0);
var vb = vec3(0.0, 0.942809, 0.333333);
var vc = vec3(-0.816497, -0.471405, 0.333333);
var vd = vec3(0.816497, -0.471405, 0.333333);

    
// light position in eye coordinates
// light at eye
var lightPosition = vec4(0.0, 0.0, 0.0, 1.0 );
// light to the right of sphere at start
// if move eye, light stays
//var lightPosition = vec4(5.0, 0.0, viewer.radius, 1.0 );
//var lightPosition = vec4(1.0, 1.0, 1.0, 1.0 );

//var lightAmbient = vec4(0.0, 0.0, 0.0, 1.0 );
//var lightAmbient = vec4(0.8, 0.8, 0.8, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
//var lightAmbient = vec4(0.0, 0.2, 0.0, 1.0 );

//var lightDiffuse = vec4( 0.0, 0.0, 0.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
//var lightDiffuse = vec4( 0.0, 1.0, 0.0, 1.0 );

//var lightSpecular = vec4(  0.0, 0.0, 0.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
//var lightSpecular = vec4(  0.0, 1.0, 0.0, 1.0 );

// starter color
var materialAmbient = vec4( 1.0, 1.0, 0.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 10.0; 
// try changing this to 10 and 100

// silver  

/* var materialAmbient = vec4( 0.19225,0.19225,0.19225, 1.0 );
var materialDiffuse = vec4( 0.5754, 0.5754, 0.5754, 1.0 );
var materialSpecular = vec4( 0.0508273, 0.0508273, 0.0508273, 1.0 );
var materialShininess = 1000.0; */


// red material; try changing light color
/* var materialAmbient = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialShininess = 1.0; */


var ambientColor, diffuseColor, specularColor;

var temp = vec4(0.0, 0.0, 0.0, 1.0);

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

// =================== create sphere 
function triangle(a, b, c) {

     normalsArray.push(a);
     normalsArray.push(b);
     normalsArray.push(c);
	 // play: create an incorrect normal vector to see what happens
	 //normalsArray.push(c + Math.random());
     
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);

     numVertices += 3;
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
		// normalize 3d vector
        ab = normalize(ab, false);
        ac = normalize(ac, false);
        bc = normalize(bc, false);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
	// comment out next line to create an open object
    //divideTriangle(a, c, d, n);
}

// ========================== run program 

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
	
    gl.enable(gl.DEPTH_TEST);
	
	// play with turning culling on/off (sphere is open)
	//gl.enable(gl.CULL_FACE);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

	console.log("Ambient products = ",ambientProduct);
	console.log("Diffuse products = ",diffuseProduct);
	console.log("Specular products = ",specularProduct);
    
	// create sphere
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
	console.log("computed sphere  numVertices = ",numVertices);
	
	// report number of vertices and triangles to html page
	document.getElementById("numVertices").innerHTML="Number of vertices = " + numVertices;
	document.getElementById("numTris").innerHTML="Number of triangles = " + numVertices/3;
	
	// load the light
	pointsArray.push(lightPosition[0]);
	pointsArray.push(lightPosition[1]);
	pointsArray.push(lightPosition[2]);
	// not used, but size should match points
	normalsArray.push(1.0);
	normalsArray.push(0.0);
	normalsArray.push(0.0);
	
	

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
	console.log("vNormal = ",vNormal);
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    
    
	// define mouse event listeners
	mouseControls();
    
	// User interface to increase or decrease the number of subdivisions
    document.getElementById("buttonIncreaseSubdiv").onclick = function(){
        numTimesToSubdivide++; 
        numVertices = 0;
        pointsArray = []; 
		normalsArray = [];
        init();
    };
    document.getElementById("buttonDecreaseSubdiv").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        numVertices = 0;
        pointsArray = []; 
		normalsArray = [];
		init();
    };

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


    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess ); 
	   
	projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
	
	console.log("light position = ",lightPosition);

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
	       
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    
	// not using now
	gl.uniform1i(gl.getUniformLocation(program,"colorFlag"), 1);
      
 	  
    for( var i=0; i<numVertices; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );
	 
	// draw the light -- not hooked up to shader -- see "shadedSphereLight" program
	gl.uniform1i( gl.getUniformLocation(program, "colorFlag"),0 );
	gl.drawArrays( gl.POINTS, numVertices, 1);

    window.requestAnimFrame(render);
}
