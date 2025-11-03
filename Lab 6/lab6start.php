<?php 

abstract class Operation {
  protected $operand_1;
  protected $operand_2;
  public function __construct($o1, $o2) {
    // Make sure we're working with numbers...
    if (!is_numeric($o1) || !is_numeric($o2)) {
      throw new Exception('Non-numeric operand.');
    }
    
    // Assign passed values to member variables
    $this->operand_1 = $o1;
    $this->operand_2 = $o2;
  }
  public abstract function operate();
  public abstract function getEquation(); 
}

// Addition subclass inherits from Operation
class Addition extends Operation {
  public function operate() {
    return $this->operand_1 + $this->operand_2;
  }
  public function getEquation() {
    return $this->operand_1 . ' + ' . $this->operand_2 . ' = ' . $this->operate();
  }
}


// Part 1 - Add subclasses for Subtraction, Multiplication and Division here

// Subtraction subclass inherits from Operation
class Subtraction extends Operation {
  public function operate() {
    return $this->operand_1 - $this->operand_2;
  }
  public function getEquation() {
    return $this->operand_1 . ' - ' . $this->operand_2 . ' = ' . $this->operate();
  }
}

// Multiplication subclass inherits from Operation
class Multiplication extends Operation {
  public function operate() {
    return $this->operand_1 * $this->operand_2;
  }
  public function getEquation() {
    return $this->operand_1 . ' * ' . $this->operand_2 . ' = ' . $this->operate();
  }
}

// Division subclass inherits from Operation
class Division extends Operation {
  public function operate() {
    if ($this->operand_2 == 0) {
      throw new Exception('Division by zero.');
    }
    return $this->operand_1 / $this->operand_2;
  }
  public function getEquation() {
    return $this->operand_1 . ' / ' . $this->operand_2 . ' = ' . $this->operate();
  }
}

// End Part 1




// Some debugs - un comment them to see what is happening...
// echo '$_POST print_r=>',print_r($_POST);
// echo "<br>",'$_POST vardump=>',var_dump($_POST);
// echo '<br/>$_POST is ', (isset($_POST) ? 'set' : 'NOT set'), "<br/>";
// echo "<br/>---";




// Check to make sure that POST was received 
// upon initial load, the page will be sent back via the initial GET at which time
// the $_POST array will not have values - trying to access it will give undefined message

  if($_SERVER['REQUEST_METHOD'] == 'POST') {
    $o1 = $_POST['op1'];
    $o2 = $_POST['op2'];
  }
  $err = Array();


// Part 2 - Instantiate an object for each operation based on the values returned on the form
//          For example, check to make sure that $_POST is set and then check its value and 
//          instantiate its object
// 
// The Add is done below.  Go ahead and finish the remiannig functions.  
// Then tell me if there is a way to do this without the ifs

  try {
    if (isset($_POST['add']) && $_POST['add'] == 'Add') {
      $op = new Addition($o1, $o2);
    }
// Put the code for Part 2 here  \/
    elseif (isset($_POST['sub']) && $_POST['sub'] == 'Subtract') {
      $op = new Subtraction($o1, $o2);
    }
    elseif (isset($_POST['mult']) && $_POST['mult'] == 'Multiply') {
      $op = new Multiplication($o1, $o2);
    }
    elseif (isset($_POST['div']) && $_POST['div'] == 'Divide') {
      $op = new Division($o1, $o2);
    }

// End of Part 2   /\

  }
  catch (Exception $e) {
    $err[] = $e->getMessage();
  }
?>

<!doctype html>
<html>
<head>
<title>Lab 6</title>
</head>
<body>
  <pre id="result">
  <?php 
    if (isset($op)) {
      try {
        echo $op->getEquation();
      }
      catch (Exception $e) { 
        $err[] = $e->getMessage();
      }
    }
      
    foreach($err as $error) {
        echo $error . "\n";
    } 
  ?>
  </pre>
  <form method="post" action="lab6start.php">
    <input type="text" name="op1" id="name" value="" />
    <input type="text" name="op2" id="name" value="" />
    <br/>
    <!-- Only one of these will be set with their respective value at a time -->
    <input type="submit" name="add" value="Add" />  
    <input type="submit" name="sub" value="Subtract" />  
    <input type="submit" name="mult" value="Multiply" />  
    <input type="submit" name="div" value="Divide" />  
  </form>
</body>
</html>

<?php
/*
 * Question Answers
 *
 * Question 1: Explain what each of your classes and methods does, the order in which
 * methods are invoked, and the flow of execution after one of the operation buttons
 * has been clicked.
 *
 * Classes and Methods:
 * - Operation (abstract class): Defines the structure for all mathematical operations.
 *   Contains two protected properties ($operand_1, $operand_2) and a constructor that
 *   validates numeric input. It declares two abstract methods: operate() and getEquation()
 *   that must be implemented by all subclasses.
 *
 * - Addition, Subtraction, Multiplication, Division (subclasses): Each extends Operation
 *   and implements the two abstract methods:
 *   - operate(): Performs the actual mathematical operation (+, -, *, /)
 *   - getEquation(): Returns a formatted string showing the equation and result
 *
 * Flow of Execution after button click:
 * 1. User enters two numbers and clicks an operation button (e.g., "Add")
 * 2. Form is submitted via POST to lab6start.php
 * 3. PHP checks if REQUEST_METHOD is POST (line 83)
 * 4. If POST, extracts $o1 and $o2 from $_POST array (lines 84-85)
 * 5. In the try block (line 98), checks which button was pressed using isset()
 * 6. Based on button pressed, instantiates appropriate operation object (e.g., new Addition($o1, $o2))
 * 7. Constructor validates that operands are numeric, throws exception if not (lines 8-10)
 * 8. If valid, stores operands in object properties (lines 13-14)
 * 9. In the HTML section (line 123), checks if $op is set
 * 10. Calls $op->getEquation() which internally calls operate() to compute result
 * 11. getEquation() returns formatted string showing the equation
 * 12. Result is displayed in the <pre> tag
 * 13. Any exceptions caught are added to $err array and displayed
 *
 *
 * Question 2: Explain how the application would differ if you were to use $_GET,
 * and why this may or may not be preferable.
 *
 * ANSWER:
 * If we used $_GET instead of $_POST, all of the data would be sent in the URL query string, all form values would be visible in the browser's address bar, 
 * and the URL could be bookmarked or shared with the calculation pre-filled. 
 * 
 * For this specific lab, we'd prefer to stay with post because we don't need the calculation to be bookmarkable or shareable, and we want to avoid exposing the operands in the URL.
 * We also want to prevent issues with URL length limits and avoid accidental resubmission from URL sharing/bookmarking.
 *
 * Question 3: Please explain whether or not there might be another (better +/-) way
 * to determine which button has been pressed and take the appropriate action.
 *
 * Yes, there's a much simpler approach, which is a just to create an associative array that maps the button names to the class names. If we use this method,
 * we don't need to use multiple if/elseif statements. 
 */
?>
