var u_step;
var v_step;
var x_slices;
var y_slices;
function drawTorus(){ 
    u_step=2*pi/10;
    v_step=2*pi/10;
    x_slices = (2*pi)/u_step+1;
    y_slices = (2*pi)/v_step+1;
    for(var u=0;u<=2*pi;u=u+u_step){
        for(var v=0;v<=2*pi;v=v+v_step){
            var a = 0.2;
            var b = 0.1;
            var points=vec3((a+b*Math.cos(v))*Math.cos(u),(a+b*Math.cos(v))*Math.sin(u),b*Math.sin(v));
            var du = vec3(-(a+b*Math.cos(v))*Math.sin(u),(a+b*Math.cos(v))*Math.cos(u),0);
            var dv = vec3(-b*Math.sin(v)*Math.cos(u),-b*Math.sin(v)*Math.sin(u),b*Math.cos(v));
            var normal=normalize(cross(du,dv));
            pointsArray.push(points);
            normalsArray.push(normal);  
            numPoints++;          
        }
        
    }  
    buildTriangles(x_slices,y_slices);
}
function drawCone(){
    u_step=2*pi/60;
    v_step=0.4/60;
    x_slices = (2*pi)/u_step+1;
    y_slices = (0.4)/v_step+1;
    for(var u=0;u<=2*pi;u=u+u_step){
        for(var v=0;v<=0.4;v=v+v_step){
            var points=vec3(v*Math.cos(u),v*Math.sin(u),v);
            var du = vec3(-v*Math.sin(u),v*Math.cos(u),0);
            var dv = vec3(Math.cos(u),Math.sin(u),1);
            var normal=normalize(cross(du,dv))
            pointsArray.push(points);
            normalsArray.push(normal); 
            numPoints++;
        }
        
    }  
    buildTriangles(x_slices,y_slices);
}
function buildTriangles(x_slices,y_slices){
    indexPoints = [];
    indexNormals = [];
    console.log(pointsArray.length)
    for(var i=0;i<x_slices-1;i++){
        for(var j=0;j<y_slices-1;j++){
            indexPoints.push(i*x_slices+j);
            indexPoints.push(i*x_slices+j+1);
            indexPoints.push((i+1)*x_slices+j);
            indexPoints.push((i+1)*x_slices+j);
            indexPoints.push((i+1)*x_slices+j+1);
            indexPoints.push(i*x_slices+j+1);
            numVertices += 6;
        }
    }
}