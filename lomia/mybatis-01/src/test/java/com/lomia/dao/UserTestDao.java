package com.lomia.dao;
import com.lomia.utils.MybatisUtils;
import org.junit.Test;
import com.lomia.pojo.User;
import java.util.List;
import org.apache.ibatis.session.SqlSession;

public class UserTestDao {
    @Test
    public void test() {
//        1.获得SqlSession对象
        SqlSession sqlSession = MybatisUtils.getSqlSession();
//        2.执行sql
        UserDao userDao = sqlSession.getMapper(UserDao.class);
        List<User> userList = userDao.getUserList();
        for (User user : userList){
            System.out.println(user);
        }




        sqlSession.close();
    }
}
