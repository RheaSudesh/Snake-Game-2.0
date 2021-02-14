/* THIS IS JUST DEMO TESTS TO LEARN TESTING SHALL SUBMIT REAL TESTS SOON*/

function hello()
{
    console.log("hello");
    return "hello";
}


describe("Login of New Players", function() {

//     var playerID="Rhea";
//     var result=game.submitPleyer(playerID);
//     it("contains spec with an expectation", function() {
//       expect(result).toBe(true);
//     });
//   });

  it("Defines addPlayer", function () {
    expect(typeof hello).toBe("function");
  });


  it("Content addPlayer", function () {
    expect(hello()).toBe("hello");
  });
});





describe("Start Game", function() {

    it("Create a snake board", function() {
      expect(true).toBe(true);
    });
  });

  
    