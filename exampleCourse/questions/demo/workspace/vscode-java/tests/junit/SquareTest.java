import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.TestReporter;
import org.junit.jupiter.params.provider.ValueSource;

@Tag("maxpoints=16")
public class SquareTest {

    @ParameterizedTest(name = "Test with input {0}")
    @ValueSource(ints = { 0, 1, 2, 4, 10, -1, -10, -100 })
    @Tag("points=2")
    public void testSquareFunction(int i, TestReporter reporter) {

        reporter.publishEntry("Testing with input " + i + "...");
        assertEquals(i * i, Square.square(i));
        reporter.publishEntry("PASSED");
    }
}
