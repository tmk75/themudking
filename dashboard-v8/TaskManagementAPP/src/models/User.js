// User model
class User {
  constructor(id, name, email, password, groups = []) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.groups = groups;
  }
}

export default User;