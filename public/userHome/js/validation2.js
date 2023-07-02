$(document).ready(function () {

    // $('#login').validate({
    //     rules: {
    //       email: {
    //         required: true,
    //         emailcheck: true
    //       },
    //       password: {
    //         required: true,
    //         pwcheck: true
    //       }
    //     },
    //     messages: {
    //       email: {
    //         required: 'Please enter an email address',
    //         emailcheck: 'Please enter a valid email address'
    //       },
    //       password: {
    //         required: 'Please enter a password',
    //         pwcheck: 'Please enter a valid password'
    //       }
    //     }
    //   });
      
  
    // $.validator.addMethod("emailcheck", function (value, element) {
    //   return this.optional(element) || /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value);
    // }, "Please enter a valid email address.");
  
  
    // $.validator.addMethod("pwcheck", function (value) {
    //   return /^[A-Za-z0-9]*$/.test(value) // consists of only these
    //     && /[a-z]/.test(value) // has a lowercase letter
    //     && /\d/.test(value) // has a digit
    // });
  
  
  
  
  
    /////register///////
    $("#register").validate({
      rules: {
        firstName: {
          required: true,
          namecheck: true,
        },
        lastName: {
            required: true,
            namecheck: true,
          },
        mobileNumber: {
          required: true,
          mbcheck: true,
        },
        email: {
          required: true,
          emailcheck: true,
        },

      },
      messages: {
        name: {
          required: "",
          namecheck: "Please enter a valid name",
        },
        email: {
          required: "",
          email: "enter valid email address",
        },
        mobile: {
          required: "",
          mbcheck: "enter valid mobile number",
        },
        
      },
    });
  
  
    $.validator.addMethod("namecheck", function (value, element) {
      return this.optional(element) || /^[a-zA-Z]+$/.test(value);
    }, "Please enter a valid name.");
  
    $.validator.addMethod("emailcheck", function (value, element) {
      return this.optional(element) || /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value);
    }, "Please enter a valid email address.");
  
    $.validator.addMethod("pwcheck", function (value) {
      return (
        /^[A-Za-z0-9]*$/.test(value) && // consists of only these
        /[a-z]/.test(value) && // has a lowercase letter
        /\d/.test(value)
      ); // has a digit
    });
  
  
  
    $.validator.addMethod("mbcheck", function (value) {
      return /^(0|91)?[6-9][0-9]{9}$/.test(value); // consists of only these
    });
  
  
  
    $("#signup").submit(function (e) {
      if (
        $.trim($("#name").val()) === "" ||
        $.trim($("#email").val()) === "" ||
        $.trim($("#firstPassword").val()) === "" ||
        $.trim($("#password").val()) === ""
      ) {
        e.preventDefault();
        $("#fillout").show();
      } else if (
        $.trim($("#name").val()) &&
        $.trim($("#email").val()) &&
        $.trim($("#firstPassword").val()) &&
        $.trim($("#password").val())
      ) {
        $("#fillout").hide();
  
        var pass = $("#firstPassword").val();
        var pass2 = $("#password").val();
        if (pass2 !== pass) {
          e.preventDefault();
          $("#notmatch").show();
        }
      }
  
  
  
  
  
  
    });
  
  
  })