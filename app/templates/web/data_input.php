<?php
	try{
		$dsn = getenv('MYSQL_DSN');
	    $user = getenv('MYSQL_USER');
	    $password = getenv('MYSQL_PASSWORD');
	    if (!isset($dsn, $user) || false === $password) {
	        throw new Exception('Set MYSQL_DSN, MYSQL_USER, and MYSQL_PASSWORD environment variables');
	    }

	    $conn = new PDO($dsn, $user, $password);

	    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		$sql = "INSERT INTO users (name, email)
		  VALUES ('John', 'john@example.com')";
		  // use exec() because no results are returned
		  $conn->exec($sql);
		  echo "New record created successfully";
	} catch(PDOException $e) {
		echo $sql . "<br>" . $e->getMessage();
	}
?>