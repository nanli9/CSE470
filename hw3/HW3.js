

var canvas;
var gl;

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
var moveVector;
var speed = 0.005;

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

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

//define the min and max box
var Box=[
    vec3(x_min,y_max,z_min),
    vec3(x_max,y_max,z_min),
    vec3(x_max,y_min,z_min),
    vec3(x_min,y_min,z_min),
    vec3(x_min,y_max,z_max),
    vec3(x_max,y_max,z_max),
    vec3(x_max,y_min,z_max),
    vec3(x_min,y_min,z_max) 
]
//push the box into point array to draw
function drawBox(){
    for(var i=0;i<Box.length;i++)
        pointsArray.push(Box[i]);
    quad(0,1,2,3);
    quad(2,6,5,1);
    quad(0,4,7,3);
    quad(4,5,6,7);
    quad(0,1,5,4);
    quad(2,6,7,3);
}
function quad(a,b,c,d){
    pointsArray.push(Box[a]);
    pointsArray.push(Box[b]);
    pointsArray.push(Box[c]);
    pointsArray.push(Box[d]);
    pointsArray.push(Box[a]);
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
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
	
	console.log("ambient product = ",ambientProduct);
    
    moveVector = normalize(vec3(Math.random(),Math.random(),Math.random()));
    console.log("moveVector", moveVector);
    document.getElementById("moveVector").innerHTML = "The current moveVector is ("+ moveVector +")";
    var surfacesType = document.getElementById("surfaceSelector").value;
    if(surfacesType=="cylinder"){
        drawCylinder();
        console.log("drawCylinder");
    }
    else if(surfacesType=="torus"){
        drawTorus();
        console.log("drawTorus");
    }
    
    drawBox();

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

    document.getElementById("surfaceSelector").onchange = function(){
        numVertices = 0;
        numPoints = 0;
        pointsArray = []; 
		normalsArray = [];
        init();
    };
    document.getElementById("lightLocSelector").onchange = function(){
        console.log(document.getElementById("lightLocSelector").value);
        var lightLoc=document.getElementById("lightLocSelector").value;
        if(lightLoc=="eye"){
            lightPosition = vec4(0.0, 0.0, 3.0, 1.0 );
            gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
        }
        else if(lightLoc=="otherPos"){
            lightPosition = vec4(10.0, 10.0, 3.0, 1.0 );
            gl.uniform4fv( gl.getUniformLocation(program, 
                "lightPosition"),flatten(lightPosition) );
        }
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
    
    modelViewMatrix = lookAt(viewer.eye, viewer.at, viewer.up);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    for( var i=numPoints; i<numPoints+8; i++){
        gl.drawArrays( gl.POINTS, i, 1 );
    }
    //gl.drawArrays( gl.LINES, numVertices, 2 );
    for( var i=numPoints+8; i<pointsArray.length; i+=5){
        gl.drawArrays( gl.LINES, i, 2 );
        gl.drawArrays( gl.LINES, i+1, 2 );
        gl.drawArrays( gl.LINES, i+2, 2 );
        gl.drawArrays( gl.LINES, i+3, 2 );
    }

    if(kft>1){
        kft=0;
        modelViewMatrix = mult(modelViewMatrix,translate(pos[0],pos[1],pos[2]));
    }
    else{
        kft+=stepsize;
        pos[0] += speed*moveVector[0];
        pos[1] += speed*moveVector[1];
        pos[2] += speed*moveVector[2];
        modelViewMatrix = mult(modelViewMatrix,translate(pos[0],pos[1],pos[2]));
    }
    //have reflective vectors
    if(pos[0]<=x_min){
        n = vec3(1,0,0);
        moveVector = normalize(subtract(moveVector,scale(2*dot(moveVector,n),n)));    
    }
    else if(pos[0]>=x_max){
        n = vec3(-1,0,0);
        moveVector = normalize(subtract(moveVector,scale(2*dot(moveVector,n),n)));
     
    }
    if(pos[1]<=y_min){
        n = vec3(0,1,0);
        moveVector = normalize(subtract(moveVector,scale(2*dot(moveVector,n),n)));
     
    }
    else if(pos[1]>=y_max){
        n = vec3(0,-1,0);
        moveVector = normalize(subtract(moveVector,scale(2*dot(moveVector,n),n)));
    }
    if(pos[2]<=z_min){
        n = vec3(0,0,1);
        moveVector = normalize(subtract(moveVector,scale(2*dot(moveVector,n),n)));   
    }
    else if(pos[2]>=z_max){
        n = vec3(0,0,-1);
        moveVector = normalize(subtract(moveVector,scale(2*dot(moveVector,n),n)));
        
    }
    document.getElementById("moveVector").innerHTML = "The current moveVector is ("+ moveVector +")";
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
          
    //for( var i=0; i<numVertices; i=i+3) 
      //  gl.drawArrays( gl.TRIANGLES, i,3);
    gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_SHORT, 0 );

    
    

    animation= window.requestAnimFrame(render);
}
