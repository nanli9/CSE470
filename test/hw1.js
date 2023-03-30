var canvas;
var gl;
var offset=vec4(0.1,0.1,0.1,0.1);
var justOne = 0;
var deltaRadians = (3.14/4)/120;
var numberofVertices=15;
var thetaLoc;
var offsetLoc;
//rotate angle for copies
var theta=0.0;
//rotate angle for prototype
var alpha=0.0;
var colors = [
    ];
	for(i=0;i<numberofVertices+2;i++)
	{
		let x=Math.random();
		let y=Math.random();
		let z=Math.random();
		colors.push(vec3(x, y, z));
		colors.push(vec3(x, y, z));
		colors.push(vec3(x, y, z));
	}

window.onload = function init()
{
	// document is refering to the document object model (DOM)
	// This allows us to communicate with the HTML web page
	// We are creating a short name for the canvas/drawing space
    canvas = document.getElementById( "gl-canvas" );
    
	// set up to use webgl in the canvas
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
    gl.viewport( 0, 0, canvas.width, canvas.height);
	
	// background color of canvas
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	//  Load shaders (defined in GLSL code in HTML file)
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	// We will use these shaders from now on
    gl.useProgram( program );
    
    var vertices = [
		vec2(0,0),
		vec2(0.2,0)		
    ];
	
	//add vertexs to form a circle 
	
	var angle=2*Math.PI/numberofVertices;
	var radius=0.2;
	for(i=1;i<=numberofVertices;i++){
		vertices.push(vec2(radius*Math.cos(angle*i),radius*Math.sin(angle*i)));
		vertices.push(vec2(0,0))
	}
	let points=vertices[vertices.length-2]
	vertices.push(points)
	vertices.push(vec2(0.2,0.1))
	vertices.push(vec2(0.25,0.15))
	vertices.push(points)
	vertices.push(vec2(0.2,-0.1))
	vertices.push(vec2(0.25,-0.15))
	console.log(vertices)
	//load vertex to GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	//load color to GPU
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

	// associate shader offset variable 	
	offsetLoc = gl.getUniformLocation( program, "offset" );
	// associate shader theta variable    
    thetaLoc = gl.getUniformLocation( program, "theta" );
    

    justOne = 0;
	render();
	
    
};
function render() {
	
	
    gl.clear( gl.COLOR_BUFFER_BIT );
	gl.uniform4f(offsetLoc, 1,1,0,0);
	
	theta += deltaRadians;
	gl.uniform1f(thetaLoc, theta);
	
	var angle=2*Math.PI/10;
	var radius=0.8;
	for(i=0;i<10;i++)
	{
		gl.uniform4f(offsetLoc, radius*Math.cos(angle*i),radius*Math.sin(angle*i),0,0);
		for(j=0;j<30;j++){
		gl.drawArrays( gl.TRIANGLES, j, 3); 
		}
		gl.drawArrays( gl.TRIANGLES, 32, 3); 
	gl.drawArrays( gl.TRIANGLES, 35, 3); 
	}

	gl.uniform4f(offsetLoc,0,0,0,0)
	alpha -= deltaRadians;
	gl.uniform1f(thetaLoc, alpha);
	for(i=0;i<30;i++){
		gl.drawArrays( gl.TRIANGLES, i, 3); 
	}
	gl.drawArrays( gl.TRIANGLES, 32, 3); 
	gl.drawArrays( gl.TRIANGLES, 35, 3); 
	requestAnimFrame(render);
	
}
