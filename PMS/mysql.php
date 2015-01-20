
<?php
class mysql {
    private $db_host; //数据库主机
    private $db_user; //数据库用户名
    private $db_pwd; //数据库用户名密码
    private $db_database; //数据库名

    private $mysqli;

   
    /*构造函数*/
    public function __construct($db_host, $db_user, $db_pwd, $db_database) {
        $this->mysqli = new mysqli($db_host,$db_user,$db_pwd,$db_database); 
    } 

    public function insert($table,$columns,$values){

               //$this->mysqli->select_db($db);
               if($this->mysqli->errno == 0)  //判断当前连接是否成功
               {
                  $sql = "INSERT INTO $table($columns) VALUES($values)";
                  $result = $this->mysqli->query($sql);
                  echo $this->mysqli->affected_rows;  //输出影响的行数
                  echo $sql;  //输出影响的行数
               }
               else
               {
                   echo $this->mysqli->error;  //输出当前错误信息
                   exit();
               }
    }

    public function select($table){
        $mysqli = $this->mysqli;
        if($mysqli->errno == 0)  //判断当前连接是否成功
       {
          $sql = "SELECT * FROM $table";
          $result = $mysqli->query($sql);
          //echo json_encode(mysqli_fetch_array($result)); //显示结果集数量

          //迭代结果集
          while($rowObject = $result->fetch_object())
          {
              echo "$rowObject->id : $rowObject->client_number : $rowObject-> : $rowObject->address"."<br>";
          }
       }
       else
       {
           echo $mysqli->error;  //输出当前错误信息
           exit();
       }
    }

    /**
 * object 转 array
 */
public function object_to_array($obj){
    $_arr = is_object($obj)? get_object_vars($obj) : $obj;
    foreach ($_arr as $key => $val) {
        $val = (is_array($val)) || is_object($val) ? object_to_array($val) : $val;
        $arr[$key] = $val;
    }

    return $arr;
}
 
}
?>