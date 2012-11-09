describe("component", function(){

  describe("when starting a component instance", function(){

    var MyComponent, initializer, options;

    beforeEach(function(){
      initializer = jasmine.createSpy("initializer");
      options = {};

      MyComponent = Marionette.Component(function(intializers){
        intializers.addInitializer(initializer);
      });

      var myComp = new MyComponent();
      myComp.start(options);
    });

    it("should run initializers", function(){
      expect(initializer).toHaveBeenCalled();
    });

    it("should pass options through initializers", function(){
      expect(initializer).toHaveBeenCalledWith(options);
    });
  });

  describe("when passing options through the constructor", function(){
    var MyComponent, initializer, options;

    beforeEach(function(){
      initializer = jasmine.createSpy("initializer");
      options = {foo: "bar"};

      MyComponent = Marionette.Component(function(intializers){
        intializers.addInitializer(initializer);
      });

      var myComp = new MyComponent(options);
      myComp.start();
    });

    it("should pass options through initializers", function(){
      var opts = initializer.mostRecentCall.args[0];
      expect(opts.foo).toBe("bar");
    });
  });

  describe("when passing options through the constructor and start method", function(){
    var MyComponent, initializer;

    beforeEach(function(){
      initializer = jasmine.createSpy("initializer");

      MyComponent = Marionette.Component(function(intializers){
        intializers.addInitializer(initializer);
      });

      var myComp = new MyComponent({foo: "bar", x: "1"});
      myComp.start({baz: "quux", x: "override"});
    });

    it("should merge the options", function(){
      var opts = initializer.mostRecentCall.args[0];
      expect(opts.foo).toBe("bar");
      expect(opts.baz).toBe("quux");
    });
    
    it("should override constructor options with start method options", function(){
      var opts = initializer.mostRecentCall.args[0];
      expect(opts.x).toBe("override");
    });
  });

  describe("when starting a component that is already started", function(){

    var MyComponent, initializer;

    beforeEach(function(){
      initializer = jasmine.createSpy("initializer");

      MyComponent = Marionette.Component(function(intializers){
        intializers.addInitializer(initializer);
      });

      var myComp = new MyComponent();
      myComp.start();
      myComp.start();
    });

    it("should run initializers once", function(){
      expect(initializer.callCount).toBe(1);
    });
  });

  describe("when stopping a component instance", function(){

    var MyComponent, finalizer;

    beforeEach(function(){
      finalizer = jasmine.createSpy("finalizer");

      MyComponent = Marionette.Component(function(intializers){
        intializers.addFinalizer(finalizer);
      });

      var myComp = new MyComponent();
      myComp.start();

      myComp.stop();
    });

    it("should run finalizers", function(){
      expect(finalizer).toHaveBeenCalled();
    });
  });

  describe("when stopping a component that is not started", function(){

    var MyComponent, finalizer;

    beforeEach(function(){
      finalizer = jasmine.createSpy("finalizer");

      MyComponent = Marionette.Component(function(intializers){
        intializers.addFinalizer(finalizer);
      });

      var myComp = new MyComponent();

      myComp.stop();
    });

    it("should not run finalizers", function(){
      expect(finalizer).not.toHaveBeenCalled();
    });
  });

  describe("when stopping a component that is already stopped", function(){

    var MyComponent, finalizer;

    beforeEach(function(){
      finalizer = jasmine.createSpy("finalizer");

      MyComponent = Marionette.Component(function(intializers){
        intializers.addFinalizer(finalizer);
      });

      var myComp = new MyComponent();
      myComp.start();

      myComp.stop();
      myComp.stop();
    });

    it("should run the finalizers once", function(){
      expect(finalizer.callCount).toBe(1);
    });
  });

  describe("when stopping and restarting and stopping a component", function(){

    var MyComponent, initializer, finalizer;

    beforeEach(function(){
      initializer = jasmine.createSpy("finalizer");
      finalizer = jasmine.createSpy("initializer");

      MyComponent = Marionette.Component(function(intializers){
        intializers.addInitializer(initializer);
        intializers.addFinalizer(finalizer);
      });

      var myComp = new MyComponent();
      myComp.start();
      myComp.stop();
      myComp.start();
      myComp.stop();
    });

    it("should run the finalizers twice", function(){
      expect(finalizer.callCount).toBe(2);
    });

    it("should run the initializers twice", function(){
      expect(initializer.callCount).toBe(2);
    });
  });

  describe("when starting and stopping two instances of the same component", function(){

    var MyComponent, c1, c2, initializer, finalizer;

    beforeEach(function(){
      initializer = jasmine.createSpy("initializer");
      finalizer = jasmine.createSpy("finalizer");

      MyComponent = Marionette.Component(function(intializers){
        intializers.addInitializer(initializer);
        intializers.addFinalizer(finalizer);
      });

      c1 = new MyComponent();
      c2 = new MyComponent();

      c1.start();
      c2.start();

      c1.stop();
      c2.stop();
    });

    it("should run initializers twice", function(){
      expect(initializer.callCount).toBe(2);
    });

    it("should run finalizers", function(){
      expect(finalizer.callCount).toBe(2);
    });

    it("should create separate object instances", function(){
      expect(c1 === c2).toBe(false);
    });
  });

  describe("when supplying a controller instance to the component", function(){
    var component, controller, pub, _priv;

    beforeEach(function(){
      pub = jasmine.createSpy("public function");
      _priv = jasmine.createSpy("private function");

      // define a component
      var MyComponent = Marionette.Component(function(intializers, backbone, marionette, $, _){

        // build a controller
        var Controller = Marionette.Controller.extend({
          pub: pub,
          _priv: _priv
        });

        intializers.addInitializer(function(options){
          controller = new Controller();
          this.setController(controller);
        });
      });

      // get the component instance
      component = new MyComponent();
      component.start();

      // run the controller method from the component
      component.pub();
    });

    it("should attach all 'public' controller methods to the component", function(){
      expect(_.isFunction(component.pub)).toBe(true);
    });
    
    it("should not attach any 'private' controller methods (methods that start with '_') to the component instance", function(){
      expect(component._priv).toBeUndefined();
    });

    it("should execute controller methods in the context of the controller", function(){
      expect(pub.mostRecentCall.object).toBe(controller);
    });

  });

});