import prisma from "../../DB/db.config.js";
const dropoutWholeBatch = async (req,res)=>{
    const { product_id, batch_id } = req.body;

    if (!product_id || !batch_id) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          message: "Missing required fields: product_id or batch_id",
        });
    }
    const temp = await prisma.batch.findFirst({
      where:{
        product_uuid:product_id
      },
      select:{
        producthistory_uuid:true
      }
    })
    console.log(temp);

    return res.status(200).json({message:"done...."})
}


















const dropoutCodes =()=>{
    
}

export {dropoutWholeBatch , dropoutCodes}