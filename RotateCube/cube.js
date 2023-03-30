
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

var mvMatrix, pMatrix;
var mvMatrix2;
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

function colorCube()
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
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        colors.push(vertexColors[a]);
        
    }
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    console.log(points);
    console.log(colors);
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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    // can demo error that happens if input '3' rather than '4'
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

     // also demo 2 or 4 here
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    modelView = gl.getUniformLocation( program, "modelView" );
	mvMatrix = mat4();
    //event listeners for buttons
    
    document.getElementById( "xButton" ).onclick = function () {
        console.log("pressed x");
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
       console.log("pressed y");
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        console.log("pressed z");
        axis = zAxis;
    };
        
    render();
}
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 0.2;
    //console.log("theta = ",theta);

    gl.uniform3fv(thetaLoc, theta);

    mvMatrix = mult(scalem(0.5, 0.5, 0.5), rotate(theta[0],-1,0.2,0.5));
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) ); 

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame( render );
}

