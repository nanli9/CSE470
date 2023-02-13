var canvas;
var gl;

var initPos=[];
var moveSpeed=0.007;
var numCube=9;
var numVertices = 8;
var numTriangles = 12;
var scale=0.1;
var kft=0;
var stepsize=0;
var startAngle;
var stopAngle;

var rotateAxis = [];

var cubeVertices = [];
var cubeColor = [];
var cubeCenter = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

var mvMatrix;

var modelView;
var vertices = [
	vec3( 0.0, 0.0,  0.0),
	vec3( 0.0, 1.0,  0.0 ),
	vec3( 1.0, 1.0,  0.0 ),
	vec3( 1.0, 0.0,  0.0 ),
	vec3( 0.0, 0.0, -1.0 ),
	vec3( 0.0, 1.0, -1.0),
	vec3( 1.0, 1.0, -1.0 ),
	vec3( 1.0, 0.0, -1.0 )
];

// Create your own colors!!
var vertexColors = [
        [ 0.5, 0.3, 0.0, 1.0 ],   
        [ 1.0, 0.4, 0.3, 1.0 ],   
        [ 1.0, 1.0, 0.2, 1.0 ],   
        [ 0.3, 1.0, 0.5, 1.0 ],   
        [ 0.1, 0.1, 0.3, 1.0 ],   
        [ 0.7, 0.3, 1.0, 1.0 ],  
        [ 0.0, 0.7, 0.6, 1.0 ],  
        [ 0.2, 1.0, 1.0, 1.0 ]   
];

function createCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{

    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    console.log("indices = ",indices);

    for ( var i = 0; i < indices.length; ++i ) {
        cubeVertices.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        cubeColor.push(vertexColors[a]);
        
    }
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    createCube();

    console.log(cubeVertices);
    console.log(cubeColor);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
	// try turning off to demo z-buffer HSR NOT
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeColor), gl.STATIC_DRAW );

    // can demo error that happens if input '3' rather than '4'
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW );

     // also demo 2 or 4 here
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelView = gl.getUniformLocation( program, "modelView" );
	mvMatrix = mat4();
    //event listeners for buttons
    
    document.getElementById( "scale" ).oninput = function () {
        console.log(this.value);
        scale = this.value;
    };
    document.getElementById( "KFT" ).oninput = function () {
       console.log(this.value);
        
    };
    canvas.addEventListener("mousedown", function(){
        console.log("Click");
        var screenx = event.clientX - canvas.offsetLeft;
		  var screeny = event.clientY - canvas.offsetTop;
		  
		  var posX = 2*screenx/canvas.width-1;
		  var posY = 2*(canvas.height-screeny)/canvas.height-1;
		  
          t1 = vec2(posX,posY);

        console.log("first point event x=",event.clientX);
        console.log("first point event y=",event.clientY);
        console.log("first point canvas x=",t1[0]);
        console.log("first point canvas y=",t1[1]);

    });
    
    for(var i=0;i<numCube-1;i++)
    {
        let rotateAxisX=Math.random()*2-1;
        let rotateAxisY=Math.random()*2-1;
        let rotateAxisZ=Math.random()*2-1;
        rotateAxis.push(normalize(vec4(rotateAxisX,rotateAxisY,rotateAxisZ,0)));  
        
        initPos.push(vec4(-0.5,-0.5,-0.5,0));
    }
    console.log(rotateAxis);
    render();
}
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 1;
    //console.log(theta)
    //draw cube 0
    mvMatrix = mult(scalem(scale, scale, scale), translate(-0.5, -0.5, -0.5));
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) ); 
    gl.drawArrays( gl.TRIANGLES, 0, numTriangles*3,2);

    for(var i=0;i<numCube-1;i++){
        //
        //console.log(rotateAxis);
        for(var j=0;j<initPos.length;j++){
            initPos[i][j] = initPos[i][j] + moveSpeed*rotateAxis[i][j];
        }
        //console.log(initPos);
        mvMatrix = mult(scalem(scale, scale, scale), translate(initPos[i][0], initPos[i][1], initPos[i][2]));
        mvMatrix = mult(mvMatrix,rotate(theta[0],rotateAxis[i][0],rotateAxis[i][1],rotateAxis[i][2]));
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) ); 
        gl.drawArrays( gl.TRIANGLES, 0, numTriangles*3,2);
    
    }
    //console.log(initPos.x);
    
    requestAnimFrame( render );
}

