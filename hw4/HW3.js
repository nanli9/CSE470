 

var canvas;
var gl;
var program;
// sphere definition
var numTimesToSubdivide = 4;
var numVertices = 0;
var numPoints = 0;
var pointsArray = [];
var normalsArray = [];
var indexPoints=[];
var indexNormals=[];
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

//animation var
var animation;
var kft = 0.0;
var stepsize = 0.005;
var pos=vec3(0,0,0);
var moveVector = vec3(0,0,-1)
var speed = 0.0;
var scale_x,scale_y,scale_z;
var animationToggle=false;

var pi=3.14;
// ortho box
var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;
var near = 0.01;
var farFactor = 3.0;
var far = viewer.radius * farFactor;

var n;
var x_min = -0.7;
var x_max = 0.7;
var y_min = -0.7;
var y_max = 0.7;
var z_min = -0.7;
var z_max = 0.7;

//perspective para
var  fovy = 45.0; 
var  aspect = 1; 


 
// sphere initial points
var va = vec3(0.0, 0.0, -1.0);
var vb = vec3(0.0, 0.942809, 0.333333);
var vc = vec3(-0.816497, -0.471405, 0.333333);
var vd = vec3(0.816497, -0.471405, 0.333333);
    
// light position is defined in eye coordinates
var lightPosition = vec4(0.0, 0.0, 3.0, 1.0 );
//var lightPosition = vec4(0.0, 0.0, 0.0, 1.0 );
//var lightPosition = vec4(10.0, 0.0, 0.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );


// gold-yellow material
// emerald material

var materialAmbient = vec4( 0.0215,0.1745,0.0215, 1.0 );
var materialDiffuse = vec4( 0.07568, 0.61424, 0.07568, 1.0 );
var materialSpecular = vec4( 0.633, 0.727811, 0.633, 1.0 );
var materialShininess = 0.6;


// red material; try changing light color
/*
var materialAmbient = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialDiffuse = vec4( 0.3, 0.0, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialShininess = 10.0; 
*/

var ambientColor, diffuseColor, specularColor;
//matrix 
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var scaleMatrix=mat4();
var normalMat, normalMatrixLoc;


var planePoints=[
    vec3( -0.8, -0.5,  0.8),
    vec3( -0.8,  -0.55,  0.8),
    vec3( 0.8,  -0.55,  0.8),
    vec3( 0.8, -0.5,  0.8),
    vec3( -0.8, -0.5, -0.8),
    vec3( -0.8,  -0.55, -0.8),
    vec3( 0.8,  -0.55, -0.8),
    vec3( 0.8, -0.5, -0.8)
]
function quad(a,b,c,d){
    pointsArray.push(planePoints[a]); 
     
    pointsArray.push(planePoints[b]); 
     
    pointsArray.push(planePoints[c]); 
   
    pointsArray.push(planePoints[a]); 

    pointsArray.push(planePoints[c]); 

    pointsArray.push(planePoints[d]);
}
function drawPlane(){
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

// ==================== run program
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
    

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
	
	console.log("ambient product = ",ambientProduct);
    
    drawTorus();
    
    
    var lightLoc=document.getElementById("lightLocSelector").value;
    if(lightLoc=="eye"){
        lightPosition = vec4(0.0, 0.0, 3.0, 1.0 );
        pointsArray.push(vec3(0.0, 0.0, 3.0));
        normalsArray.push(vec3(0,0,0));
    }
    else if(lightLoc=="otherPos"){
        lightPosition = vec4(-0.7, -0.7, 2.0, 1.0 );
        pointsArray.push(vec3(-0.7, -0.7, 2.0));
        normalsArray.push(vec3(0,0,0));
    }

    drawPlane();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);


    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(indexPoints)), gl.STATIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, flatten(indexPoints), gl.STATIC_DRAW);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    // define mouse event listeners
	mouseControls();
    
	
    document.getElementById("animation").onclick = function(){
        console.log("toggle animation");
        if(animationToggle){
            animationToggle=false;
            speed = 0.005;
        }
        else{
            animationToggle=true;
            speed = 0.00;
        }
        
        
    };
    document.getElementById("ortho").onclick = function(){
        console.log("change to ortho");
        
        projectionMatrix = ortho(left, right, bottom, ytop, near, far);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    };
    document.getElementById("perspective").onclick = function(){
        console.log("change to perspective");
        projectionMatrix = perspective(fovy, aspect, near, far);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
        console.log(viewer.eye);
    };
    document.getElementById("materialSelector").onchange = function(){
        console.log(document.getElementById("materialSelector").value);
        
        var materialType = document.getElementById("materialSelector").value;
        if(materialType=="emerald"){
            console.log("emerald");
            materialAmbient = vec4( 0.0215,0.1745,0.0215, 1.0 );
            materialDiffuse = vec4( 0.07568, 0.61424, 0.07568, 1.0 );
            materialSpecular = vec4( 0.633, 0.727811, 0.633, 1.0 );
            materialShininess = 0.6;
        }
        else if(materialType=="jade"){
            console.log("jade");
            materialAmbient = vec4( 0.135,0.2225,0.1575, 1.0 );
            materialDiffuse = vec4( 0.54, 0.89, 0.63, 1.0 );
            materialSpecular = vec4( 0.316228, 0.316228, 0.316228, 1.0 );
            materialShininess = 0.1;
        }
        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);
        gl.uniform4fv( gl.getUniformLocation(program, 
            "ambientProduct"),flatten(ambientProduct) );
         gl.uniform4fv( gl.getUniformLocation(program, 
            "diffuseProduct"),flatten(diffuseProduct) );
         gl.uniform4fv( gl.getUniformLocation(program, 
            "specularProduct"),flatten(specularProduct) );	
         gl.uniform1f( gl.getUniformLocation(program, 
            "shininess"),materialShininess );
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
    //cancel the render call back
    if(animation){
        window.cancelAnimationFrame(animation);
    }
    render();
}

    

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.uniform1i(gl.getUniformLocation(program,"objectColorFlag"), 0);
    gl.uniform1i(gl.getUniformLocation(program,"objectFlag"), 0);
    
    modelViewMatrix = lookAt(viewer.eye, viewer.at, viewer.up);
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.uniform1i(gl.getUniformLocation(program,"colorFlag"), 0);
    gl.drawArrays( gl.POINTS, numPoints, 1 );

    gl.uniform1i(gl.getUniformLocation(program,"colorFlag"), 1);
    normalMat = modelViewMatrix;
	
	gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMat) );
    
    
    document.getElementById("moveVector").innerHTML = "The current moveVector is ("+ moveVector +")";
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    normalMat = inverse4(modelViewMatrix);
	
	gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMat));
    
    gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_SHORT, 0 );


    gl.uniform1i(gl.getUniformLocation(program,"objectColorFlag"), 1);
    gl.uniform1i(gl.getUniformLocation(program,"objectFlag"), 1);
    gl.drawArrays( gl.TRIANGLES, 122, 36 );
    animation= window.requestAnimFrame(render);
}
