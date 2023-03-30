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
function drawCylinder(){
    u_step=2*pi/10;
    v_step=0.4/10;
    x_slices = (2*pi)/u_step+1;
    y_slices = (0.4)/v_step+1;
    for(var u=0;u<=2*pi;u=u+u_step){
        for(var v=0;v<=0.4;v=v+v_step){
            /*
            var r = 2;
            //var points=vec3(r*Math.cos(u)*Math.sin(v),r*Math.sin(u)*Math.sin(v),r*Math.cos(v));
            var x=(r+Math.cos(u/2)*Math.sin(v)-Math.sin(u/2)*Math.sin(2*v))*Math.cos(u);
            var y=(r+Math.cos(u/2)*Math.sin(v)-Math.sin(u/2)*Math.sin(2*v))*Math.sin(u);
            var z=Math.sin(u/2)*Math.sin(v)+Math.cos(u/2)*Math.sin(2*v);
            var points=vec3(x,y,z);

            var du_x= -0.5*(Math.sin(u/2)*Math.sin(v)+Math.cos(u/2)*Math.sin(2*v))*Math.cos(u)-
            (-Math.sin(2*v)*Math.sin(u/2)+Math.sin(v)*Math.cos(u/2)+r)*Math.sin(u);
            var du_y=-0.5*(Math.sin(u/2)*Math.sin(v)+Math.cos(u/2)*Math.sin(2*v))*Math.sin(u)+
            (-Math.sin(2*v)*Math.sin(u/2)+Math.sin(v)*Math.cos(u/2)+r)*Math.cos(u);
            var du_z=-0.5*(Math.sin(2*v)*Math.sin(u/2)-Math.sin(v)*Math.cos(u/2))

            var dv_x= (Math.cos(u/2)*Math.cos(v)-2*Math.sin(u/2)*Math.cos(2*v))*Math.cos(u);
            var dv_y=(Math.cos(u/2)*Math.cos(v)-2*Math.sin(u/2)*Math.cos(2*v))*Math.sin(u);
            var dv_z=Math.sin(u/2)*Math.cos(v)+2*Math.cos(u/2)*Math.cos(2*v);
            
            var du = vec3(du_x,du_y,du_z);
            var dv = vec3(dv_x,dv_y,dv_z);
            var normal=normalize(cross(du,dv))
            pointsArray.push(points);
            normalsArray.push(normal); 

            */
            var r = 0.2;
            var points=vec3(r*Math.cos(u),r*Math.sin(u),v);
            var du = vec3(-r*Math.sin(u),r*Math.cos(u),0);
            var dv = vec3(0,0,1);
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