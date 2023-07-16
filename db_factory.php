<?php

include 'db_info.php';

class DatabaseFactory
{
    private static $factory;
    private $database;

    public static function getFactory()
    {
        if (!self::$factory) {
            self::$factory = new DatabaseFactory();
        }
        return self::$factory;
    }

    public function getConnection() {
		$DB_TYPE = "mysql";
		$DB_HOST = "localhost";
		$DB_NAME = "marinesystem";
		$DB_USER = "root";
		$DB_PASS = "r12345";
		$DB_PORT = "3306";
		$DB_CHARSET = "utf8";

        if (!$this->database) {
            $options = array(PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ, PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING);
            $this->database = new PDO(
                $DB_TYPE . ':host=' . $DB_HOST . ';dbname=' .
                $DB_NAME . ';port=' . $DB_PORT . ';charset=' . $DB_CHARSET,
                $DB_USER, $DB_PASS, $options
            );
        }
        return $this->database;
    }
}

?>