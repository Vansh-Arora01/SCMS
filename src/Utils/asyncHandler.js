
const asynchandler =(requesthandler)=>{
    return (req,res,next)=>{
        // make a promise so get rid of try
        Promise
        .resolve(requesthandler(req,res,next))
        .catch((err)=>next(err))
    }

};

export {asynchandler}