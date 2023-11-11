const whiteList = ['http://localhost:5173','https://four04nomore.onrender.com']

const corsOption = {
    origin:(origin,callback)=>{
    if(whiteList.indexOf(origin)!=-1 || !origin){
        callback(null,true);
    }
    else{
        callback(new Error("Not Allowed by Cors"))
    }
},
optionSuccessStatus:200
}

module.exports = corsOption;