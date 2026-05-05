async function testApi() {
  try {
    const res = await fetch('http://localhost:5000/api/courses');
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

testApi();
