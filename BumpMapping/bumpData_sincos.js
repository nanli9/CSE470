
// Bump Data
// Create circular region bumps 
 

function createBumpMapSinCos() {
	
	var x, y, val;
	// create a sharper edge with a threshold
	var threshold = 0.5;
	
	var data = new Array();
    for (var i = 0; i<= texSize; i++)  
		data[i] = new Array();
	
	// create a texture-sized 2d array of height values
	// first make them all 0
    for (var i = 0; i<= texSize; i++) {
		x = (i/texSize)*8*Math.PI;
		for (var j=0; j<=texSize; j++) {
			y = (j/texSize)*8*Math.PI;
			val = Math.sin(x) * Math.cos(y);
			if(val > threshold)
				data[i][j] = val;
			else 
				data[i][j] = 0.0;
		}
	}
		
	 

	// Bump Map Normals
	// Use a forward difference for the derivative
	// [1 0 du] x [0, 1, dv] = [-du -dv 1]
    
	var normalst = new Array()
		for (var i=0; i<texSize; i++)  
			normalst[i] = new Array();
		
    for (var i=0; i<texSize; i++) 
		for ( var j = 0; j < texSize; j++) 
			normalst[i][j] = new Array();
		
    for (var i=0; i<texSize; i++) {
		for ( var j = 0; j < texSize; j++) {
			normalst[i][j][0] = -(data[i+1][j]-data[i][j]);
			normalst[i][j][1] = -(data[i][j+1]-data[i][j]);
			normalst[i][j][2] = 1;
		}
    }

	// Transform normals so they conform to texture format, 
	// which is a color [0, 255]. Do it in 5 steps
	// step 1) normalize the normal so each component lives in [-1,1]
	// step 2) scale to [-0.5, 0.5]
	// step 3) translate to [0, 1]

    for (var i=0; i<texSize; i++) {
		for (var j=0; j<texSize; j++) {
			// find length of vector
			var d = 0;
			for(k=0;k<3;k++) 
				d+=normalst[i][j][k]*normalst[i][j][k];
			d = Math.sqrt(d);
			// normalize, scale to [-0.5, 0.5], and translate
			for(k=0;k<3;k++) 
				normalst[i][j][k]= 0.5*normalst[i][j][k]/d + 0.5;
		}
    }
	// step 4) scale each component from [0,1] to [0, 255]
	// step 5) load into linear array of correct format

    for ( var i = 0; i < texSize; i++ ) 
        for ( var j = 0; j < texSize; j++ ) 
           for(var k =0; k<3; k++) 
                bumpNormals[3*texSize*i+3*j+k] = 255*normalst[i][j][k];

}