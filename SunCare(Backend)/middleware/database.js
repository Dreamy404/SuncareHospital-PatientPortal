const mysql2=require('mysql2/promise');


class Database{
    static instance;

    static async getConnection(){
        if(!Database.instance){
            Database.instance= await mysql2.createConnection({
                  host:'localhost',
                  user:'root',
                  password:'rubayat1234',
                  database:'Suncare_Hospital'
            });
        }
    
        return Database.instance;
    }
    
}

module.exports=Database;