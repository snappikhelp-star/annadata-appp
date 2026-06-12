<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PriyamX Media Launch</title>

<style>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body{
  background:#000;
  overflow:hidden;
  height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  font-family:Arial, sans-serif;
}

.launch-screen{
  text-align:center;
  animation:fadeOut 5s ease forwards;
  animation-delay:3.5s;
}

.logo{
  font-size:4rem;
  font-weight:900;
  color:white;
  letter-spacing:8px;
  text-transform:uppercase;
  animation:glow 2s infinite alternate;
}

.tagline{
  margin-top:15px;
  color:#ccc;
  font-size:1.2rem;
  letter-spacing:3px;
  animation:slideUp 1.5s ease;
}

.line{
  width:0;
  height:4px;
  background:#00ff88;
  margin:20px auto;
  animation:expand 2s forwards;
}

@keyframes glow{
  from{
    text-shadow:0 0 10px #00ff88;
  }
  to{
    text-shadow:0 0 30px #00ff88,0 0 60px #00ff88;
  }
}

@keyframes expand{
  to{
    width:250px;
  }
}

@keyframes slideUp{
  from{
    opacity:0;
    transform:translateY(30px);
  }
  to{
    opacity:1;
    transform:translateY(0);
  }
}

@keyframes fadeOut{
  to{
    opacity:0;
    transform:scale(1.3);
  }
}
</style>
</head>

<body>

<div class="launch-screen">
  <div class="logo">PRIYAMX MEDIA</div>
  <div class="line"></div>
  <div class="tagline">Creating Digital Success Stories</div>
</div>

</body>
</html>
